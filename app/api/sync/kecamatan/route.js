import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DAPODIK_CONFIG } from '@/lib/config';

// --- HELPERS ---
let DAPODIK_INTERNAL_CACHE_TOKEN = null;
const esc = (v) => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''").trim()}'`;

async function withRetry(fn, retries = 3, delay = 2000) {
  try { return await fn(); } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`⚠️ Gagal: ${err.message}. Retry dalam ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

async function getDapodikToken() {
  if (DAPODIK_INTERNAL_CACHE_TOKEN) return DAPODIK_INTERNAL_CACHE_TOKEN;
  return await withRetry(async () => {
    const params = new URLSearchParams();
    params.append('username', process.env.DAPODIK_USERNAME);
    params.append('password', process.env.DAPODIK_PASSWORD);
    const res = await fetch(DAPODIK_CONFIG.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(10000)
    });
    const result = await res.json();
    if (!result.access_token) throw new Error("Dapodik Auth Failed");
    DAPODIK_INTERNAL_CACHE_TOKEN = result.access_token;
    return DAPODIK_INTERNAL_CACHE_TOKEN;
  }, 3);
}

async function fetchSekolahPage(kode_kec, page, token) {
  return await withRetry(async () => {
    const url = `${DAPODIK_CONFIG.baseUrl}${DAPODIK_CONFIG.endpoints.sekolah}?page=${page}&per_page=100&kode_kecamatan=${kode_kec}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-API-KEY': DAPODIK_CONFIG.apiKey },
      signal: AbortSignal.timeout(30000)
    });
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error(`Sekolah API Error: Server ngasih HTML (Status ${res.status})`);
    }
    const json = await res.json();
    return json.data || json;
  }, 3, 3000);
}

async function fetchSekolahAllPages(kode_kec, token) {
  let allSchools = [];
  let currentPage = 1;
  let hasNextPage = true;
  while (hasNextPage) {
    const schools = await fetchSekolahPage(kode_kec, currentPage, token);
    if (schools && schools.length > 0) {
      allSchools = [...allSchools, ...schools];
      if (schools.length === 100) currentPage++;
      else hasNextPage = false;
    } else {
      hasNextPage = false;
    }
  }
  return allSchools;
}

async function syncPTKBySekolah(sekolah, token) {
  return await withRetry(async () => {
    const url = `${DAPODIK_CONFIG.baseUrl}${DAPODIK_CONFIG.endpoints.ptkBySekolah}?npsn=${sekolah.npsn.trim()}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-API-KEY': DAPODIK_CONFIG.apiKey },
      signal: AbortSignal.timeout(25000)
    });
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error(`PTK API Error: Server sibuk (Status ${res.status})`);
    }
    const json = await res.json();
    const ptkList = json.data || json;
    if (Array.isArray(ptkList) && ptkList.length > 0) {
      const uniqueMap = new Map();
      ptkList.forEach(p => { if (p.nik?.trim().length >= 10) uniqueMap.set(p.nik.trim(), p); });
      const valid = Array.from(uniqueMap.values());
      const values = valid.map(p => `(
        ${esc(p.nik)}, ${esc(p.nuptk?.slice(0, 16))}, ${esc(p.nip?.slice(0, 18))}, 
        ${esc(p.nama?.toUpperCase().slice(0, 100))}, ${esc(sekolah.npsn.trim())}, NOW()
      )`).join(',');
      await prisma.$executeRawUnsafe(`
        INSERT INTO data_ptk (nik, nuptk, nip, nama_ptk, npsn, last_sync)
        VALUES ${values} ON CONFLICT (nik) DO UPDATE SET last_sync = EXCLUDED.last_sync, nama_ptk = EXCLUDED.nama_ptk;
      `);
    }
  }, 3, 3000);
}

async function upsertSekolahRaw(sekolahList) {
  if (!sekolahList?.length) return;
  const uniqueMap = new Map();
  sekolahList.forEach(s => { if (s.npsn) uniqueMap.set(s.npsn.trim(), s); });
  const valid = Array.from(uniqueMap.values());
  const values = valid.map(s => `(
    ${esc(s.npsn)}, ${esc(s.sekolah_id)}, ${esc(s.nama?.toUpperCase().slice(0, 150))}, 
    ${esc(s.kode_kecamatan)}, NOW()
  )`).join(',');
  await prisma.$executeRawUnsafe(`
    INSERT INTO satuan_pendidikan (npsn, sekolah_id, nama, kode_kecamatan, last_sync)
    VALUES ${values} ON CONFLICT (npsn) DO UPDATE SET last_sync = EXCLUDED.last_sync, nama = EXCLUDED.nama;
  `);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const daftarKodeKec = searchParams.getAll('kode_kecamatan');
  if (!daftarKodeKec.length) return NextResponse.json({ error: "Pilih kecamatan" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        const token = await getDapodikToken();
        send({ message: `🚀 Memulai Sync Wilayah (${daftarKodeKec.length} kecamatan)...`, progress: 0 });

        for (let i = 0; i < daftarKodeKec.length; i++) {
          const kodeKec = daftarKodeKec[i];
          const infoKec = await prisma.ref_wilayah.findFirst({ where: { kode_kecamatan: kodeKec.trim() } });
          const namaKec = infoKec?.kecamatan || kodeKec;

          send({ message: `📦 Menarik sekolah di ${namaKec}...` });
          const schools = await fetchSekolahAllPages(kodeKec, token);
          
          if (schools?.length > 0) {
            await upsertSekolahRaw(schools);
            const ptkBatchSize = 10; 
            for (let j = 0; j < schools.length; j += ptkBatchSize) {
              const batch = schools.slice(j, j + ptkBatchSize);
              const progressKec = Math.round((j / schools.length) * 100);

              send({ 
                message: `Sync PTK ${j}/${schools.length} di ${namaKec}...`, 
                progress: Math.round(((i) / daftarKodeKec.length * 100) + (progressKec / daftarKodeKec.length)),
                progressKec: progressKec 
              });

              await Promise.all(batch.map(s => 
                syncPTKBySekolah(s, token).catch(e => console.error(`Err NPSN ${s.npsn}: ${e.message}`))
              ));
              await new Promise(r => setTimeout(r, 1000));
            }
          }
          const progressGlobal = Math.round(((i + 1) / daftarKodeKec.length) * 100);
          send({ message: `✅ Selesai: ${namaKec}`, progress: progressGlobal });
          await new Promise(r => setTimeout(r, 3000));
        }
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik;`);
        send({ message: "🏁 Selesai!", progress: 100, done: true });
        controller.close();
      } catch (err) {
        send({ error: err.message });
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
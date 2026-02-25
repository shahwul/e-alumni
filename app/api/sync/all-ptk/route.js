import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DAPODIK_CONFIG } from '@/lib/config';

let DAPODIK_INTERNAL_CACHE_TOKEN = null;

async function withRetry(fn, retries = 3, delay = 2000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`⚠️ Gagal: ${err.message}. Mencoba lagi (${retries} retries left)...`);
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
    if (!result.access_token) throw new Error("Token tidak ditemukan di response");
    DAPODIK_INTERNAL_CACHE_TOKEN = result.access_token;
    return DAPODIK_INTERNAL_CACHE_TOKEN;
  }, 3);
}

const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").trim()}'`;
};

const formatDateSql = (dateStr) => {
  if (!dateStr || dateStr === "" || dateStr === "0000-00-00") return 'NULL';
  return `'${dateStr}'::date`;
};

async function syncSatuSekolah(sekolah, dapoToken) {
  try {
    const ptkList = await withRetry(async () => {
      const url = `${DAPODIK_CONFIG.baseUrl}${DAPODIK_CONFIG.endpoints.ptkBySekolah}?npsn=${sekolah.npsn.trim()}`
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${dapoToken}`,
          'X-API-KEY': DAPODIK_CONFIG.apiKey,
        },
        signal: AbortSignal.timeout(25000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    }, 3);

    if (Array.isArray(ptkList) && ptkList.length > 0) {
      const uniquePtkMap = new Map();
      ptkList.forEach(p => {
        if (p.nik && p.nik.trim().length >= 10) {
          uniquePtkMap.set(p.nik.trim(), p);
        }
      });

      const validPtk = Array.from(uniquePtkMap.values());
      if (validPtk.length === 0) return;

      const values = validPtk.map(p => `(
        ${escapeSql(p.nik)}, ${escapeSql(p.nuptk?.slice(0, 16))}, ${escapeSql(p.nip?.slice(0, 18))}, 
        ${escapeSql(p.nama?.toUpperCase().slice(0, 100))}, ${escapeSql(p.jenis_kelamin?.slice(0, 1))}, 
        ${escapeSql(p.tempat_lahir?.slice(0, 32))}, ${formatDateSql(p.tanggal_lahir)}, 
        ${escapeSql(p.agama?.slice(0, 25))}, ${escapeSql(p.no_hp?.slice(0, 20))}, 
        ${escapeSql(p.email?.toLowerCase().slice(0, 100))}, ${escapeSql(p.status_kepegawaian?.slice(0, 40))}, 
        ${escapeSql(p.pangkat_golongan?.slice(0, 30))}, ${escapeSql(p.jenis_ptk?.slice(0, 30))}, 
        ${escapeSql(p.jabatan_ptk?.slice(0, 50))}, ${escapeSql(p.tugas_tambahan_jabatan_ptk_jabatan_ptk?.slice(0, 50))}, 
        ${escapeSql(p.riwayat_pendidikan_formal_jenjang_pendidikan?.slice(0, 50))},
        ${escapeSql(p.riwayat_pendidikan_formal_bidang_studi?.slice(0, 50))},
        ${escapeSql(p.riwayat_sertifikasi_bidang_studi_bidang_studi?.slice(0, 50))},
        ${p.masa_kerja_thn ? parseInt(p.masa_kerja_thn) : 0}, ${escapeSql(sekolah.npsn.trim())}, NOW()
      )`).join(',');

      await withRetry(async () => {
        await prisma.$executeRawUnsafe(`
          INSERT INTO data_ptk (
            nik, nuptk, nip, nama_ptk, jenis_kelamin, tempat_lahir, 
            tanggal_lahir, agama, no_hp, email, status_kepegawaian, 
            pangkat_golongan, jenis_ptk, jabatan_ptk, tugas_tambahan_jabatan_ptk, 
            riwayat_pendidikan_formal_jenjang_pendidikan, riwayat_pendidikan_formal_bidang_studi, riwayat_sertifikasi_bidang_studi,
            masa_kerja_thn, npsn, last_sync
          )
          VALUES ${values}
          ON CONFLICT (nik) 
          DO UPDATE SET 
            nuptk = EXCLUDED.nuptk, nip = EXCLUDED.nip, nama_ptk = EXCLUDED.nama_ptk,
            jenis_kelamin = EXCLUDED.jenis_kelamin, tempat_lahir = EXCLUDED.tempat_lahir,
            tanggal_lahir = EXCLUDED.tanggal_lahir, agama = EXCLUDED.agama,
            no_hp = EXCLUDED.no_hp, email = EXCLUDED.email, 
            status_kepegawaian = EXCLUDED.status_kepegawaian, pangkat_golongan = EXCLUDED.pangkat_golongan,
            jenis_ptk = EXCLUDED.jenis_ptk, jabatan_ptk = EXCLUDED.jabatan_ptk,
            tugas_tambahan_jabatan_ptk = EXCLUDED.tugas_tambahan_jabatan_ptk, riwayat_pendidikan_formal_jenjang_pendidikan = EXCLUDED.riwayat_pendidikan_formal_jenjang_pendidikan,
            riwayat_pendidikan_formal_bidang_studi = EXCLUDED.riwayat_pendidikan_formal_bidang_studi, riwayat_sertifikasi_bidang_studi = EXCLUDED.riwayat_sertifikasi_bidang_studi,
            masa_kerja_thn = EXCLUDED.masa_kerja_thn, npsn = EXCLUDED.npsn, last_sync = EXCLUDED.last_sync;
        `);
      }, 2);
    }
  } catch (err) {
    console.error(`❌ Permanent Failure NPSN ${sekolah.npsn}: ${err.message}`);
  }
}

export async function POST(req) {
  try {
    const daftarSekolah = await prisma.satuan_pendidikan.findMany({
      select: { npsn: true, nama: true },
      orderBy: { npsn: 'asc' }
    });

    runMainFlow(daftarSekolah);

    return NextResponse.json({ message: "Sync PTK Turbo (With Max Error Handling) Started!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function runMainFlow(daftarSekolah) {
  try {
    const dapoToken = await getDapodikToken();
    if (!dapoToken) return;

    const batchSize = 10; 
    for (let i = 0; i < daftarSekolah.length; i += batchSize) {
      const batch = daftarSekolah.slice(i, i + batchSize);
      await Promise.all(batch.map(s => syncSatuSekolah(s, dapoToken)));
      console.log(`📊 Progress: ${i + batch.length}/${daftarSekolah.length} sekolah.`);
      await new Promise(r => setTimeout(r, 200)); 
    }
    
    console.log("🏁 DONE. Refreshing MV...");
    await withRetry(async () => {
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik;`);
    }, 2);
    console.log("✨ All Systems Green.");

  } catch (error) {
    console.error("💥 Critical Flow Error:", error.message);
  }
}
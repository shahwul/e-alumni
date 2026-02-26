import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DAPODIK_CONFIG } from '@/lib/config';

export const maxDuration = 300;

let DAPODIK_INTERNAL_CACHE_TOKEN = null;

async function getDapodikToken() {
  if (DAPODIK_INTERNAL_CACHE_TOKEN) return DAPODIK_INTERNAL_CACHE_TOKEN;
  try {
    const params = new URLSearchParams();
    params.append('username', process.env.DAPODIK_USERNAME);
    params.append('password', process.env.DAPODIK_PASSWORD);

    const res = await fetch(process.env.DAPODIK_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const result = await res.json();
    DAPODIK_INTERNAL_CACHE_TOKEN = result.access_token;
    return DAPODIK_INTERNAL_CACHE_TOKEN;
  } catch (error) {
    console.error("Auth Failed:", error.message);
    return null;
  }
}

/**
 * Sanitasi SQL
 */
const esc = (str) => str === null || str === undefined ? 'NULL' : `'${String(str).replace(/'/g, "''").trim()}'`;
const fDate = (d) => !d || d === "0000-00-00" ? 'NULL' : `'${d}'::date`;

async function fetchSekolah(kode_kecamatan, page, token) {
  const url = `${DAPODIK_CONFIG.baseUrl}${DAPODIK_CONFIG.endpoints.sekolah}?page=${page}&per_page=100&kode_kecamatan=${kode_kecamatan}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-KEY': DAPODIK_CONFIG.apiKey,
      },
      signal: AbortSignal.timeout(30000)
    });

    if (res.status === 429) {
      await new Promise(r => setTimeout(r, 5000));
      return fetchSekolah(kode_kecamatan, page, token);
    }

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) return null;

    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * RAW UPSERT SEKOLAH (DENGAN FILTER NPSN UNIK)
 */
async function processRawUpsert(sekolahList) {
  if (!sekolahList || sekolahList.length === 0) return;

  const uniqueSekolahMap = new Map();
  sekolahList.forEach(s => {
    if (s.npsn) {
      uniqueSekolahMap.set(s.npsn.trim(), s);
    }
  });

  const validSekolah = Array.from(uniqueSekolahMap.values());

  const values = validSekolah.map(s => `(
    ${esc(s.npsn)}, ${esc(s.sekolah_id)}, ${esc(s.nama?.toUpperCase().slice(0, 150))}, 
    ${esc(s.nama_nomenklatur?.slice(0, 150))}, ${esc(s.status_sekolah)}, 
    ${esc(s.alamat_jalan?.slice(0, 250))}, 
    ${esc(s.desa_kelurahan)}, ${esc(s.kode_kecamatan?.trim())}, 
    ${esc(s.kode_kabupaten?.trim())}, ${esc(s.kode_provinsi?.trim())}, 
    ${esc(s.kode_pos?.trim().slice(0, 10))}, ${esc(s.sk_pendirian_sekolah?.slice(0, 100))}, 
    ${fDate(s.tanggal_sk_pendirian)}, ${esc(s.status_kepemilikan)}, 
    ${esc(s.yayasan?.slice(0, 150))}, ${esc(s.sk_izin_operasional?.slice(0, 100))}, 
    ${fDate(s.tanggal_sk_izin_operasional)}, ${esc(s.npwp?.trim().slice(0, 100))}, 
    ${esc(s.nomor_telepon?.slice(0, 50))}, ${esc(s.nomor_fax?.slice(0, 50))}, 
    ${esc(s.email?.slice(0, 100))}, ${esc(s.website?.slice(0, 255))}, 
    ${esc(s.akreditasi)}, ${esc(s.keaktifan)}, NOW()
  )`).join(',');

  await prisma.$executeRawUnsafe(`
    INSERT INTO satuan_pendidikan (
      npsn, sekolah_id, nama, nama_nomenklatur,
      status_sekolah, alamat_jalan, desa_kelurahan, kode_kecamatan, 
      kode_kabupaten, kode_provinsi, kode_pos, sk_pendirian_sekolah, 
      tanggal_sk_pendirian, status_kepemilikan, yayasan, sk_izin_operasional, 
      tanggal_sk_izin_operasional, npwp, nomor_telepon, nomor_fax, 
      email, website, akreditasi, keaktifan, last_sync
    )
    VALUES ${values}
    ON CONFLICT (npsn) DO UPDATE SET
      sekolah_id = EXCLUDED.sekolah_id,
      nama = EXCLUDED.nama,
      nama_nomenklatur = EXCLUDED.nama_nomenklatur,
      status_sekolah = EXCLUDED.status_sekolah,
      alamat_jalan = EXCLUDED.alamat_jalan,
      desa_kelurahan = EXCLUDED.desa_kelurahan,
      kode_kecamatan = EXCLUDED.kode_kecamatan,
      kode_kabupaten = EXCLUDED.kode_kabupaten,
      kode_provinsi = EXCLUDED.kode_provinsi,
      kode_pos = EXCLUDED.kode_pos,
      sk_pendirian_sekolah = EXCLUDED.sk_pendirian_sekolah,
      tanggal_sk_pendirian = EXCLUDED.tanggal_sk_pendirian,
      status_kepemilikan = EXCLUDED.status_kepemilikan,
      yayasan = EXCLUDED.yayasan,
      sk_izin_operasional = EXCLUDED.sk_izin_operasional,
      tanggal_sk_izin_operasional = EXCLUDED.tanggal_sk_izin_operasional,
      npwp = EXCLUDED.npwp,
      nomor_telepon = EXCLUDED.nomor_telepon,
      nomor_fax = EXCLUDED.nomor_fax,
      email = EXCLUDED.email,
      website = EXCLUDED.website,
      akreditasi = EXCLUDED.akreditasi,
      keaktifan = EXCLUDED.keaktifan,
      last_sync = EXCLUDED.last_sync;
  `);
}

export async function POST(req) {
  try {
    const daftarKecamatan = await prisma.ref_wilayah.findMany({
      distinct: ['kode_kecamatan'],
      select: { kode_kecamatan: true, kecamatan: true }
    });

    runGlobalSync(daftarKecamatan);

    return NextResponse.json({ message: "Sync Sekolah dimulai!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function runGlobalSync(daftarKecamatan) {
  const dapoToken = await getDapodikToken();
  if (!dapoToken) return;

  const batchSize = 5;
  for (let i = 0; i < daftarKecamatan.length; i += batchSize) {
    const batch = daftarKecamatan.slice(i, i + batchSize);

    await Promise.all(batch.map(async (kec) => {
      try {
        const firstPage = await fetchSekolah(kec.kode_kecamatan, 1, dapoToken);
        if (!firstPage || !firstPage.data) return;

        const totalRows = firstPage.data[0]?.total_rows || firstPage.data.length;
        let allSekolah = firstPage.data;

        if (totalRows > 100) {
          const totalPages = Math.ceil(totalRows / 100);
          const extraRes = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) => fetchSekolah(kec.kode_kecamatan, i + 2, dapoToken))
          );
          extraRes.forEach(res => { if (res?.data) allSekolah = allSekolah.concat(res.data); });
        }

        await processRawUpsert(allSekolah);
        console.log(`Kec ${kec.kecamatan} (${allSekolah.length} schools)`);

      } catch (err) {
        console.error(`Gagal ${kec.kecamatan}: ${err.message}`);
      }
    }));
    console.log(`Progress: ${i + batch.length}/${daftarKecamatan.length} kecamatan.`);
  }
}
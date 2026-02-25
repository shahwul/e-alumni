import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DAPODIK_CONFIG } from '@/lib/config';

let DAPODIK_INTERNAL_CACHE_TOKEN = null;

/**
 * Helper: Retry Logic
 */
async function withRetry(fn, retries = 3, delay = 2000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`⚠️ Gagal: ${err.message}. Retry...`);
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
      body: params
    });
    const result = await res.json();
    DAPODIK_INTERNAL_CACHE_TOKEN = result.access_token;
    return DAPODIK_INTERNAL_CACHE_TOKEN;
  }, 3);
}

const escapeSql = (v) => v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''").trim()}'`;
const formatDSql = (v) => !v || v === "0000-00-00" ? 'NULL' : `'${v}'::date`;

export async function POST(req) {
  try {
    const { nik, npsn } = await req.json();

    if (!nik || !npsn) {
      return NextResponse.json({ error: "NIK dan NPSN wajib ada!" }, { status: 400 });
    }

    const dapoToken = await getDapodikToken();
    if (!dapoToken) throw new Error("Gagal dapet token.");

    const ptkDetail = await withRetry(async () => {
      const url = `${DAPODIK_CONFIG.baseUrl}${DAPODIK_CONFIG.endpoints.ptkDetail}?nik=${nik}&npsn=${npsn}`;
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${dapoToken}`,
          'X-API-KEY': DAPODIK_CONFIG.apiKey,
        },
        signal: AbortSignal.timeout(15000)
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error(`API Error ${res.status}`);
      }
      const json = await res.json();
      return json.data?.[0] || json.data || json;
    }, 3);

    if (!ptkDetail || !ptkDetail.nik) {
      return NextResponse.json({ message: "Data tidak ditemukan di pusat" }, { status: 404 });
    }

    const p = ptkDetail;
    await prisma.$executeRawUnsafe(`
      INSERT INTO data_ptk (
        nik, nuptk, nip, nama_ptk, jenis_kelamin, tempat_lahir, 
        tanggal_lahir, agama, no_hp, email, status_kepegawaian, 
        pangkat_golongan, jenis_ptk, jabatan_ptk, tugas_tambahan_jabatan_ptk, npsn, last_sync
      )
      VALUES (
        ${escapeSql(p.nik)}, ${escapeSql(p.nuptk?.slice(0, 16))}, ${escapeSql(p.nip?.slice(0, 18))}, 
        ${escapeSql(p.nama?.toUpperCase().slice(0, 100))}, ${escapeSql(p.jenis_kelamin?.slice(0, 1))}, 
        ${escapeSql(p.tempat_lahir?.slice(0, 32))}, ${formatDSql(p.tanggal_lahir)}, 
        ${escapeSql(p.agama?.slice(0, 25))}, ${escapeSql(p.no_hp?.slice(0, 20))}, 
        ${escapeSql(p.email?.toLowerCase().slice(0, 100))}, ${escapeSql(p.status_kepegawaian?.slice(0, 40))}, 
        ${escapeSql(p.pangkat_golongan?.slice(0, 30))}, ${escapeSql(p.jenis_ptk?.slice(0, 30))}, 
        ${escapeSql(p.jabatan_ptk?.slice(0, 50))}, ${escapeSql(p.tugas_tambahan_jabatan_ptk_jabatan_ptk?.slice(0, 50))}, 
        ${escapeSql(npsn)}, NOW()
      )
      ON CONFLICT (nik) 
      DO UPDATE SET 
        nuptk = EXCLUDED.nuptk, nip = EXCLUDED.nip, nama_ptk = EXCLUDED.nama_ptk,
        no_hp = EXCLUDED.no_hp, email = EXCLUDED.email, 
        status_kepegawaian = EXCLUDED.status_kepegawaian, last_sync = EXCLUDED.last_sync;
    `);

    return NextResponse.json({ message: `Sync detail ${p.nama} berhasil!` });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
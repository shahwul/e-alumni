// app/page.js (atau app/dashboard/page.js)
import pool from '@/lib/db';

// 1. Fungsi buat ambil data (Langsung Query SQL)
async function getDashboardData() {
  try {
    // Query ke Materialized View yang udah kita buat
    const query = `
      SELECT 
        kabupaten, 
        kecamatan, 
        COUNT(nik) as total_guru, 
        SUM(case when is_sudah_pelatihan then 1 else 0 end) as sudah_latih
      FROM mv_dashboard_analitik
      GROUP BY kabupaten, kecamatan
      ORDER BY kabupaten ASC
      LIMIT 10
    `;
    
    const res = await pool.query(query);
    return res.rows; // Data ada di sini
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// 2. Component Utama (Async)
export default async function DashboardPage() {
  const dataWilayah = await getDashboardData();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dashboard Sebaran Guru & Pelatihan</h1>
      
      {/* Contoh Tabel Sederhana */}
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Kabupaten</th>
            <th>Kecamatan</th>
            <th>Total Guru</th>
            <th>Sudah Pelatihan</th>
            <th>Progress (%)</th>
          </tr>
        </thead>
        <tbody>
          {dataWilayah.map((row, index) => {
            // Hitung persentase manual di JS
            const persentase = ((row.sudah_latih / row.total_guru) * 100).toFixed(1);
            
            return (
              <tr key={index}>
                <td>{row.kabupaten}</td>
                <td>{row.kecamatan}</td>
                <td>{row.total_guru}</td>
                <td>{row.sudah_latih}</td>
                <td>{persentase}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
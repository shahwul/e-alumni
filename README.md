# E-Alumni

Proyek **E-Alumni** dibangun menggunakan framework [Next.js](https://nextjs.org), dengan [Prisma ORM](https://www.prisma.io/) untuk manajemen database dan [Tailwind CSS](https://tailwindcss.com/) sebagai styling, serta komponen UI berbasis [Radix UI](https://www.radix-ui.com/).

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL dengan Prisma ORM
- **Caching**: Redis (`ioredis`)
- **Styling**: Tailwind CSS v4
- **Autentikasi**: JWT (`jose`, `jsonwebtoken`) & `bcrypt`
- **Email**: Nodemailer
- **Lainnya**: Leaflet (peta), Recharts (grafik), exceljs & file-saver
- **Containerization**: Docker & Nginx bawaan

## 🛠️ Persiapan Lingkungan

Konfigurasikan environment variables Anda dengan membuat file `.env` di root direktori (Anda bisa menyesuaikan dari `.env.production` jika diperlukan). Pastikan Anda telah mengatur URL database, Redis, dan kunci rahasia JWT.

## 💻 Menjalankan secara Lokal

1. **Install semua dependensi**:
   ```bash
   npm install
   ```

2. **Siapkan Database dengan Prisma**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

## 🐳 Deployment dengan Docker

Proyek ini telah dikonfigurasi siap dideploy menggunakan Docker Compose. Aplikasi, Database, dan konfigurasi Nginx dapat dibuild terpusat.

Untuk build dan menjalankan instance dari container, eksekusi perintah:
```bash
docker-compose up -d --build
```

## 📄 Dokumentasi API

Seluruh dokumentasi teknis API untuk proyek ini tersedia di direktori `docs/`:

- [**Authentication**](docs/api_dokumentasi_auth.md) (Login, Logout, Session)
- [**Dashboard**](docs/api_dokumentasi_dashboard.md) (Analytics & Stats)
- [**Manajemen Diklat**](docs/api_dokumentasi_diklat.md) (CRUD, Peserta, Alumni)
- [**PTK & Input Data**](docs/api_dokumentasi_ptk.md) (Profil PTK, Import/Validate)
- [**Rekapitulasi**](docs/api_dokumentasi_rekap.md) (Drill-down Wilayah)
- [**Referensi Data**](docs/api_dokumentasi_ref.md) (Metadata & Wilayah)
- [**Sync Dapodik**](docs/api_dokumentasi_sync.md) (Proses Sinkronisasi)
- [**Pencarian Sekolah**](docs/api_dokumentasi_sekolah.md) (Auto-complete NPSN/Nama)

# Dokumentasi API Dashboard

Endpoint ini menyediakan data analitik dan statistik ringkasan (tiles/charts) untuk tampilan dashboard utama.

---

## 1. Analytics (Data Chart)
Endpoint fleksibel untuk mendapatkan data deret waktu atau perbandingan kategori.

- **Endpoint**: `/api/dashboard/analytics`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **metric** | `string` | Metrik yang dihitung (misal: `count`). |
| **groupBy** | `string` | Dimensi pengelompokan (misal: `kabupaten`, `bulan`, `jenjang`). |
| **timeGrain** | `string` | Granularitas waktu jika groupBy adalah waktu (`year`, `month`, `day`). |
| **kab** | `string` | Filter Kode Kabupaten. |
| **kec** | `string` | Filter Nama Kecamatan. |
| **year** | `string` | Filter Tahun. |
| **jenjang** | `string` | Filter Bentuk Pendidikan. |
| **diklat** | `string` | ID Diklat (bisa comma-separated). |

---

## 2. Stats (Dashboard Summary)
Mengambil ringkasan statistik berbagai kategori (Status PTK, Jabatan, Tren Tahunan, dll).

- **Endpoint**: `/api/dashboard/stats`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **kab** | `string` | Kode Kabupaten. |
| **kec** | `string` | Nama Kecamatan. |
| **year** | `string` | Tahun statistik (default: tahun berjalan). |

- **Response Parameters**:

| Key | Deskripsi |
| :--- | :--- |
| **statusKepegawaian** | Distribusi ASN vs Non-ASN. |
| **jabatan** | Top 5 jabatan PTK. |
| **ptkVsAlumni** | Rasio PTK yang sudah vs belum pelatihan. |
| **kepsekVsGuru** | Perbandingan jumlah Kepala Sekolah dan Guru. |
| **trenTriwulan** | Data alumni per Q1-Q4. |
| **trenTahunan** | Data alumni 5 tahun terakhir. |
| **ranking** | Top list wilayah/sekolah berdasarkan jumlah alumni. |

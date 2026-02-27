# Dokumentasi API PTK & Input Data

Endpoint ini digunakan untuk pencarian data PTK (Pendidik dan Tenaga Kependidikan) serta proses validasi/import data.

---

## 1. Pencarian PTK
Mengambil data PTK dari Materialized View dengan filter yang sangat fleksibel.

- **Endpoint**: `/api/ptk`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Deskripsi |
| :--- | :--- |
| **page** | Nomor halaman. |
| **limit** | Jumlah data per halaman. |
| **search** | Cari berdasarkan Nama atau NIK. |
| **kab** | Kode Kabupaten. |
| **kec** | Nama Kecamatan. |
| **jenjang** | Bentuk Pendidikan (Bentuk Pendidikan). |
| **statusKepegawaian** | Filter status (PNS, PPPK, dll). |

---

## 2. Detail Profil PTK (Integrasi)
Mengambil profil lengkap PTK termasuk riwayat pelatihan dari berbagai sumber.

- **Endpoint**: `/api/ptk/[nik]/details`
- **Metode**: `GET`
- **Response Parameters**:
  - `terpusat`: Format data untuk kebutuhan dashboard internal.
  - `pelita`: Format data komprehensif (Profil + Riwayat Diklat + Status Alumni).

---

## 3. Validasi & Import
Digunakan pada proses upload data dari template Excel/CSV.

- **Endpoint**: `/api/input-data/validate`
- **Metode**: `POST`
- **Body**: Array objek PTK.
- **Deskripsi**: Mencocokkan data inputan dengan database untuk mengecek validitas NIK/NPSN.

- **Endpoint**: `/api/input-data/import`
- **Metode**: `POST`
- **Deskripsi**: Menyimpan data yang sudah divalidasi ke database permanen.

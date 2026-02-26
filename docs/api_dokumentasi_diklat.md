# Dokumentasi API Manajemen Diklat

Endpoint ini digunakan untuk mengelola data Diklat (Pendidikan dan Pelatihan), termasuk pendaftaran kandidat dan finalisasi peserta.

---

## 1. List & Create Diklat
Endpoint utama untuk melihat daftar diklat atau membuat diklat baru.

### A. List Diklat
- **Endpoint**: `/api/diklat`
- **Metode**: `GET`
- **Params**: `page`, `limit`, `search`, `topic_id`, `sub_topic_id`, `mode_id`, dll.
- **Response**: Mengembalikan array of objects `data` dan objek `meta` pagination.

### B. Create Diklat
- **Endpoint**: `/api/input-data`
- **Metode**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Diklat Kurikulum Merdeka",
    "topic_id": 1,
    "sub_topic_id": 1,
    "start_date": "2026-05-01",
    "end_date": "2026-05-10",
    "participant_limit": 50,
    "total_jp": 32,
    "location": "Online"
  }
  ```

---

## 2. Detail & Manajemen Diklat
- **Endpoint**: `/api/diklat/[id]`
- **Metode**: `GET` (Detail), `PUT` (Update), `DELETE` (Hapus).

---

## 3. Manajemen Peserta & Kandidat

### A. Lihat Kandidat
- **Endpoint**: `/api/diklat/[id]/kandidat`
- **Metode**: `GET`
- **Deskripsi**: Mengambil daftar PTK yang sedang dalam masa pencalonan peserta diklat.

### B. Finalisasi Alumni (Kandidat -> Peserta)
- **Endpoint**: `/api/diklat/[id]/alumni`
- **Metode**: `POST`
- **Deskripsi**: Memindahkan seluruh kandidat ke tabel alumni (finalisasi status peserta).

### C. Daftar Peserta (Alumni)
- **Endpoint**: `/api/diklat/[id]/peserta`
- **Metode**: `GET`
- **Response**: Array of PTK yang sudah terdaftar sebagai alumni di diklat tersebut.

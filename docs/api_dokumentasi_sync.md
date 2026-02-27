# Dokumentasi API Sync Dapodik

Kumpulan endpoint ini digunakan untuk mensinkronisasi data antara **E-Alumni** dan **Pusat (Dapodik)**.

---

## 1. Sync Metadata
Endpoint untuk mengecek status terakhir sinkronisasi global.

- **Endpoint**: `/api/sync/metadata`
- **Metode**: `GET`
- **Response**:
  ```json
  {
    "id": 1,
    "key": "LAST_GLOBAL_SYNC",
    "value": "2026-02-27T01:00:00.000Z" // ISO Date, "RUNNING", atau "ERROR: ..."
  }
  ```

---

## 2. Sync PTK Spesifik
Endpoint untuk memperbarui data satu PTK tertentu.

- **Endpoint**: `/api/sync/ptk`
- **Metode**: `POST`
- **Header**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "nik": "3404XXXXXXXXXXXX",
    "npsn": "204XXXXX"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Sync detail Achsanul Khulqi berhasil!"
  }
  ```

---

## 3. Global Sync (Server-Sent Events)
Melakukan sinkronisasi penuh untuk seluruh wilayah (Kecamatan -> Sekolah -> PTK). Progress akan dikirim secara *real-time* via stream data.

- **Endpoint**: `/api/sync/global`
- **Metode**: `GET`
- **Content-Type**: `text/event-stream`
- **Streaming Response Format**:
  ```text
  data: {"message": "🚀 Memulai Global Sync...", "progress": 0}
  ...
  data: {"message": "📦 Wilayah: Depok", "current": 1, "total": 17, "progress": 5}
  ...
  data: {"message": "🏁 SELESAI!", "progress": 100, "done": true, "last_sync": "..."}
  ```

---

## 4. Sync Kecamatan (Server-Sent Events)
Sinkronisasi satu atau lebih kecamatan terpilih.

- **Endpoint**: `/api/sync/kecamatan`
- **Metode**: `GET`
- **URL Parameters**:
  - `kode_kecamatan`: Kode kecamatan yang ingin disync. Bisa dikirim lebih dari satu.
- **Contoh URL**: `/api/sync/kecamatan?kode_kecamatan=34.04.01&kode_kecamatan=34.04.02`
- **Streaming Response Format**:
  ```text
  data: {"message": "🚀 Memulai Sync Wilayah (2 kecamatan)...", "progress": 0}
  ...
  data: {"message": "Sync PTK 10/45 di Gamping...", "progress": 25, "progressKec": 22}
  ```

---

## 5. Sync All PTK (Background Processing)
Memulai proses sinkronisasi seluruh data PTK untuk semua sekolah yang sudah ada di database.

- **Endpoint**: `/api/sync/all-ptk`
- **Metode**: `POST`
- **Response**:
  ```json
  {
    "message": "Sync PTK Turbo (With Max Error Handling) Started!"
  }
  ```

---

## 6. Sync All Sekolah (Background Processing)
Memulai proses sinkronisasi data sekolah untuk seluruh kecamatan yang terdaftar di referensi wilayah.

- **Endpoint**: `/api/sync/all-sekolah`
- **Metode**: `POST`
- **Response**:
  ```json
  {
    "message": "Turbo Raw Sync Sekolah dimulai!"
  }
  ```

---

## Catatan Teknis
1. **Authentication**: Semua endpoint memerlukan session yang valid melalui cookie `auth_token` (Backend Middleware).
2. **Dapodik Integration**: Backend akan melakukan request ke portal pusat menggunakan `DAPODIK_USERNAME`, `DAPODIK_PASSWORD`, dan `X-API-KEY` yang dikonfigurasi di Environment Variable server.
3. **Retry Logic**: Sistem secara otomatis mencoba ulang (retry) sebanyak 3 kali jika terjadi timeout atau kegagalan koneksi ke server pusat.
4. **Materialized View**: Setelah proses sinkronisasi selesai, sistem akan menjalankan `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_analitik` untuk memperbarui dashboard secara otomatis.

# Dokumentasi API Referensi Data

Endpoint ini digunakan untuk mengambil metadata referensi yang digunakan dalam dropdown filter dan mapping wilayah.

---

## 1. Referensi Wilayah
Mengambil daftar kabupaten dan kecamatan yang terdaftar di database.

- **Endpoint**: `/api/ref/wilayah`
- **Metode**: `GET`
- **Response Structure**:
  ```json
  [
    {
      "kabupaten": "KABUPATEN SLEMAN",
      "kecamatan": ["DEPOK", "MLATI", "GAMPING", ...]
    }
  ]
  ```

---

## 2. Metadata PTK
Mengambil daftar unik atribut PTK untuk keperluan filter (Mapel, Jabatan, dll).

- **Endpoint**: `/api/ref/ptk-metadata`
- **Metode**: `GET`
- **Response Parameters**:
  - `jenisPtk`: Array kategori PTK (Guru Kelas, Guru Mapel, dll).
  - `statusKepegawaian`: Array status (PNS, PPPK, Honorer, dll).
  - `mapel`: Array bidang studi sertifikasi.
  - `jurusan`: Array bidang studi pendidikan formal.

---

## 3. Mapping Wilayah (Name to Code)
Mengubah kumpulan nama kecamatan menjadi kumpulan kode wilayah.

- **Endpoint**: `/api/wilayah/map-kecamatan`
- **Metode**: `POST`
- **Request Body**:
  ```json
  {
    "names": ["DEPOK", "MLATI"]
  }
  ```
- **Response**: `{ "codes": ["34.04.07", "34.04.12"] }`

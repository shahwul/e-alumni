# Dokumentasi API Sekolah

Endpoint ini dikhususkan untuk pencarian data satuan pendidikan.

---

## 1. Cari Sekolah (Auto-complete)
Melakukan pencarian sekolah berdasarkan nama dengan dukungan *fuzzy search*.

- **Endpoint**: `/api/sekolah/search`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Tipe | Mandatori | Deskripsi |
| :--- | :--- | :---: | :--- |
| **q** | `string` | Y | Keyword pencarian (Minimal 3 karakter). |

- **Response Example**:
  ```json
  [
    {
      "nama_sekolah": "SD NEGERI BUMIJO",
      "npsn_sekolah": "20403477"
    }
  ]
  ```

# Dokumentasi API Rekapitulasi

Endpoint ini digunakan untuk menyajikan data statistik (rekapitulasi) baik untuk PTK (Pendidik dan Tenaga Kependidikan) maupun Sekolah, dengan dukungan hierarki wilayah (*drill-down*).

---

## 1. Rekapitulasi PTK
Menampilkan jumlah PTK berdasarkan wilayah, jenis kelamin, dan bentuk pendidikan.

- **Endpoint**: `/api/rekap`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Tipe | Mandatori | Deskripsi |
| :--- | :--- | :---: | :--- |
| **tingkat** | `string` | - | Level data: `kabupaten` (default), `kecamatan`, atau `sekolah`. |
| **parent_code** | `string` | Y* | Nama wilayah induk. (*Wajib jika tingkat adalah `kecamatan` atau `sekolah`). |

- **Response Parameters**:

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **columns** | `Array<string>` | Daftar unik `bentuk_pendidikan` yang ditemukan. |
| **data** | `Array<Object>` | List data rekap per wilayah/sekolah. |
| > id | `string` | Nama wilayah atau NPSN (sebagai identifier). |
| > wilayah | `string` | Label nama wilayah atau sekolah untuk UI. |
| > total_jml | `number` | Total seluruh PTK pada baris tersebut. |
| > total_l | `number` | Total PTK Laki-laki. |
| > total_p | `number` | Total PTK Perempuan. |
| > details | `Object` | Map berisi breakdown per jenjang. Key-nya adalah nama Jenjang. |
| >> [jenjang].jml | `number` | Jumlah PTK di jenjang tersebut. |
| >> [jenjang].l | `number` | Jumlah PTK Laki-laki di jenjang tersebut. |
| >> [jenjang].p | `number` | Jumlah PTK Perempuan di jenjang tersebut. |

- **Response Structure**:
  ```json
  {
    "columns": ["KB", "SPS", "TK", "TPA"], // Daftar bentuk pendidikan unik
    "data": [
      {
        "id": "Nama Wilayah / NPSN",
        "wilayah": "Nama Wilayah / Nama Sekolah",
        "total_jml": 150,
        "total_l": 70,
        "total_p": 80,
        "details": {
          "TK": { "jml": 50, "l": 20, "p": 30 },
          "KB": { "jml": 100, "l": 50, "p": 50 }
        }
      }
    ]
  }
  ```

---

## 2. Rekapitulasi Sekolah
Menampilkan jumlah satuan pendidikan (npsn) berdasarkan wilayah dan bentuk pendidikan.

- **Endpoint**: `/api/rekap-sekolah`
- **Metode**: `GET`
- **Request Parameters**:

| Parameter | Tipe | Mandatori | Deskripsi |
| :--- | :--- | :---: | :--- |
| **tingkat** | `string` | - | Level data: `kabupaten` (default), `kecamatan`, atau `sekolah`. |
| **parent_code** | `string` | Y* | Kode wilayah induk. (*Wajib jika tingkat adalah `kecamatan` (kode_kab) atau `sekolah` (kode_kec)). |

- **Response Parameters**:

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **columns** | `Array<string>` | Daftar unik `bentuk_pendidikan` yang ditemukan. |
| **data** | `Array<Object>` | List data rekap sekolah. |
| > id | `string` | Kode wilayah atau NPSN. |
| > wilayah | `string` | Nama wilayah atau nama sekolah. |
| > total_jml | `number` | Total jumlah sekolah pada baris tersebut. |
| > details | `Object` | Map berisi jumlah sekolah per jenjang. Key adalah nama Jenjang. |
| >> [jenjang] | `number` | Angka jumlah sekolah (integer). |

- **Response Structure**:
  ```json
  {
    "columns": ["KB", "SPS", "TK", "TPA"],
    "data": [
      {
        "id": "Kode Wilayah / NPSN",
        "wilayah": "Nama Wilayah / Nama Sekolah",
        "total_jml": 25,
        "details": {
          "TK": 10,
          "KB": 15
        }
      }
    ]
  }
  ```

---

## Catatan Tambahan
1. **Dinamis**: Array `columns` bersifat dinamis sesuai dengan data `bentuk_pendidikan` yang tersedia di database pada saat request dilakukan.
2. **Drill-down**: Metadata `id` pada respons level atas (misal Kabupaten) digunakan sebagai `parent_code` pada request level di bawahnya (Kecamatan).
3. **Optimasi**: `/api/rekap` membaca data langsung dari Materialized View `mv_dashboard_analitik` untuk performa query yang lebih cepat.

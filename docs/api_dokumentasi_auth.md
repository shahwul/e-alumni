# Dokumentasi API Authentication

Endpoint ini mengelola proses autentikasi pengguna, mulai dari pendaftaran, verifikasi OTP, login, hingga logout.

---

## 1. Login
Melakukan autentikasi pengguna dan memberikan token via HTTP-Only Cookie.

- **Endpoint**: `/api/auth/login`
- **Metode**: `POST`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response**:
  - `200 OK`: Login sukses (Cookie `auth_token` diset).
  - `401 Unauthorized`: Kredensial tidak valid.

---

## 2. Me (Check Session)
Mengambil informasi profil pengguna yang sedang login.

- **Endpoint**: `/api/auth/me`
- **Metode**: `GET`
- **Header**: Cookie `auth_token` harus ada.
- **Response Parameters**:

| Parameter | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **id** | `number` | ID unik user. |
| **nama** | `string` | Nama lengkap user. |
| **email** | `string` | Alamat email user. |
| **role** | `string` | Peran user (contoh: `SUPERADMIN`). |
| **username** | `string` | Username user. |

---

## 3. Register & Send OTP
Melakukan pengecekan ketersediaan akun atau mengirimkan kode OTP ke email.

### A. Cek Ketersediaan (Check Availability)
- **Metode**: `GET`
- **Params**: `username` atau `email`.
- **Response**: `{ "available": true, "message": "Tersedia" }`

### B. Kirim OTP (Request OTP)
- **Metode**: `POST`
- **Request Body**:
  ```json
  {
    "username": "user baru",
    "password": "password123",
    "email": "user@gmail.com",
    "nama": "User Baru"
  }
  ```
- **Response**: `200 OK`: "OTP berhasil dikirim".

---

## 4. Verify OTP (Finalize Registration)
Verifikasi kode OTP yang dikirim ke email untuk membuat akun secara permanen.

- **Endpoint**: `/api/auth/verify-otp`
- **Metode**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@gmail.com",
    "otp": "123456"
  }
  ```
- **Response**: `200 OK`: "Akun berhasil dibuat".

---

## 5. Logout
Menghapus session pengguna dengan membersihkan Cookie.

- **Endpoint**: `/api/auth/logout`
- **Metode**: `POST`
- **Response**: `200 OK`: "Logout berhasil".

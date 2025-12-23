# 🎓 Dasar API untuk Pemula (Zero Knowledge)

> Panduan untuk yang **benar-benar belum tahu apa-apa** tentang API

---

## 🍽️ Apa itu API? (Analogi Restoran)

Bayangkan kamu di **restoran**:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│     KAMU    │  ──►    │   PELAYAN   │  ──►    │   DAPUR     │
│  (Customer) │  ◄──    │  (Waiter)   │  ◄──    │  (Kitchen)  │
└─────────────┘         └─────────────┘         └─────────────┘
     Client                  API                   Server
```

| Restoran | Dunia Komputer |
|----------|----------------|
| Kamu (pelanggan) | **Client** (Postman, Browser, HP) |
| Pelayan | **API** (perantara) |
| Dapur | **Server** (database, backend) |
| Menu | **Dokumentasi API** (Swagger) |
| Makanan yang datang | **Response** (data JSON) |

**API** = **A**pplication **P**rogramming **I**nterface

- Adalah **PELAYAN** antara kamu dan dapur
- Kamu tidak bisa langsung masuk ke dapur ambil makanan
- Harus lewat pelayan (API) yang akan meneruskan pesanan kamu

---

## 🌐 Apa itu REST API?

**REST** = **Re**presentational **S**tate **T**ransfer

REST API adalah **STANDAR/ATURAN** bagaimana API berkomunikasi. Seperti aturan di restoran:
- Pelayan harus sopan ✓
- Pesanan harus jelas ✓
- Makanan diantar dalam piring ✓

**Aturan REST:**
1. Menggunakan **HTTP** (internet)
2. Menggunakan **URL** untuk menunjuk lokasi (endpoint)
3. Menggunakan format **JSON** untuk data
4. Menggunakan **HTTP Methods** (GET, POST, PUT, DELETE)

---

## 📬 Apa itu HTTP Methods? (Analogi Kantor Pos)

Bayangkan kamu mengirim surat ke kantor:

| Method | Analogi | Fungsi |
|--------|---------|--------|
| **GET** 📖 | "Tolong **AMBILKAN** data saya" | **BACA** data |
| **POST** ✉️ | "Tolong **KIRIM** data baru ini" | **BUAT** data baru |
| **PUT** ✏️ | "Tolong **GANTI** data lama dengan yang baru" | **UPDATE** seluruh data |
| **DELETE** 🗑️ | "Tolong **HAPUS** data ini" | **HAPUS** data |

### Contoh Nyata dengan Data User:

```
Database Users:
┌────┬──────────┬───────┐
│ ID │ Username │ Gold  │
├────┼──────────┼───────┤
│  1 │ shatar   │ 1000  │
│  2 │ player1  │ 500   │
└────┴──────────┴───────┘
```

| Kamu Mau | Method | URL | Hasil |
|----------|--------|-----|-------|
| Lihat semua user | **GET** | `/api/users` | Dapat list semua user |
| Lihat user id=1 | **GET** | `/api/users/1` | Dapat data shatar |
| Buat user baru | **POST** | `/api/users` | User baru dibuat |
| Update user id=1 | **PUT** | `/api/users/1` | Data shatar diupdate |
| Hapus user id=2 | **DELETE** | `/api/users/2` | player1 dihapus |

---

## 📝 Apa itu JSON?

JSON adalah **format data** yang dipakai untuk kirim/terima data. Seperti **formulir** yang sudah distandardkan.

```json
{
    "success": true,
    "balance": 1000,
    "message": "Berhasil"
}
```

**Kenapa pakai JSON?**
- Mudah dibaca manusia ✓
- Mudah dibaca komputer ✓
- Standar internasional ✓

---

## 🎯 Contoh Nyata di Project Trapeza API

### Skenario: Kamu mau cek saldo user "shatar"

**1. Kamu (Client) mengirim request:**
```
GET http://localhost:8080/api/trapeza/balance?username=shatar
```

Artinya:
- `GET` = Mau **AMBIL** data (bukan buat/hapus)
- `http://localhost:8080` = Alamat server (komputer sendiri, port 8080)
- `/api/trapeza/balance` = "Endpoint" atau lokasi layanan cek saldo
- `?username=shatar` = Parameter (mau cek saldo siapa)

**2. Server menerima dan memproses:**
```
Controller → Service → Repository → Database
     ↓           ↓           ↓           ↓
"Ada request"  "Cari user"  "Query SQL"  "Return data"
```

**3. Server mengirim response:**
```json
{
    "success": true,
    "balance": 1000,
    "message": "Balance retrieved"
}
```

---

## 🔄 Diagram Super Simple

```
┌────────────────────────────────────────────────────────────┐
│                      KAMU (POSTMAN)                        │
│                                                            │
│   "Tolong ambilkan saldo user shatar"                      │
│                     ↓                                      │
│   GET http://localhost:8080/api/trapeza/balance?username=shatar
└────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    SERVER (SPRING BOOT)                    │
│                                                            │
│   1. Controller terima request                             │
│   2. Service proses logika                                 │
│   3. Repository cari di database                           │
│   4. Return hasilnya                                       │
└────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────────┐
│                      KAMU (POSTMAN)                        │
│                                                            │
│   {"success": true, "balance": 1000, "message": "..."}     │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 Analogi Kehidupan Sehari-hari

| Aktivitas | Ini mirip dengan... |
|-----------|---------------------|
| Buka Instagram, lihat feed | **GET** `/api/posts` |
| Upload foto baru | **POST** `/api/posts` |
| Edit caption foto | **PUT** `/api/posts/123` |
| Hapus foto | **DELETE** `/api/posts/123` |
| Cek saldo GoPay | **GET** `/api/balance` |
| Transfer uang | **POST** `/api/transfer` |
| Ganti password | **PUT** `/api/user/password` |

---

## ✅ Ringkasan 1 Menit

| Istilah | Penjelasan Super Simple |
|---------|------------------------|
| **API** | Pelayan restoran antara kamu dan dapur |
| **REST** | Aturan standar bagaimana pelayan bekerja |
| **GET** | AMBIL data (lihat) |
| **POST** | KIRIM data baru (buat) |
| **PUT** | GANTI data (update) |
| **DELETE** | HAPUS data |
| **JSON** | Format "amplop" untuk data |
| **Endpoint** | Alamat/URL layanan API |
| **Request** | Permintaan kamu ke server |
| **Response** | Jawaban server ke kamu |

---

## 🎓 Tips Presentasi

Ketika menjelaskan ke dosen/teman:

1. **Mulai dengan analogi restoran** - Ini paling mudah dipahami
2. **Tunjukkan Postman** - Demo langsung lebih meyakinkan
3. **Jelaskan GET vs POST** - Ini paling sering ditanya
4. **Tunjukkan JSON response** - Bukti API bekerja

---

## 📚 Belajar Lebih Lanjut

Jika mau explore lebih dalam:
- [REST API Tutorial](https://restfulapi.net/)
- [Postman Learning Center](https://learning.postman.com/)
- [Spring Boot Guides](https://spring.io/guides)

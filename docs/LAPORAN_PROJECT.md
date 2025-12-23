# 📋 LAPORAN PROJECT TRAPEZA BANK

**Nama Project:** Trapeza Bank - Mobile Banking Application  
**Mata Kuliah:** [Nama Mata Kuliah]  
**Nama:** [Nama Mahasiswa]  
**NIM:** [NIM]  
**Tanggal:** 22 Desember 2024

---

## 1. Pendahuluan

### 1.1 Latar Belakang

Dalam era digitalisasi keuangan, layanan perbankan konvensional perlu bertransformasi menjadi layanan digital yang dapat diakses kapan saja dan di mana saja. **Trapeza** (τράπεζα) yang berarti "Bank" dalam bahasa Yunani Kuno, dikembangkan sebagai aplikasi mobile banking lengkap dengan backend REST API dan frontend web.

### 1.2 Tujuan Pengembangan

1. Menyediakan layanan **mobile banking** yang user-friendly
2. Mengelola **multi-rekening** per user
3. Menyediakan fitur **transfer**, **top up**, dan **tarik saldo**
4. Implementasi **notifikasi in-app**
5. Mengimplementasikan arsitektur **RESTful API** yang scalable

### 1.3 Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| Login & Register | ✅ | Autentikasi user |
| Cek Saldo | ✅ | Real-time balance sync |
| Top Up | ✅ | Tambah saldo + notifikasi |
| Transfer | ✅ | Transfer ke user lain + notifikasi |
| Tarik Saldo | ✅ | Withdraw + notifikasi |
| Multi-Rekening | ✅ | Buat rekening dengan nama custom |
| Setor ke Rekening | ✅ | Pindahkan gold ke rekening |
| Tarik dari Rekening | ✅ | Pindahkan rekening ke gold |
| Notifikasi In-App | ✅ | Bell icon dengan badge |
| Riwayat Transaksi | ✅ | Filter by type |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐
│     USERS       │       │   TRANSACTIONS   │
├─────────────────┤       ├──────────────────┤
│ PK id           │◄──────│ FK from_user_id  │
│    username     │◄──────│ FK to_user_id    │
│    password     │       │    amount        │
│    nama_lengkap │       │    type          │
│    gold         │       │    description   │
│    status_akun  │       │    created_at    │
│    created_at   │       └──────────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────────┐
│    ACCOUNTS     │       │  NOTIFICATIONS   │
├─────────────────┤       ├──────────────────┤
│ PK id           │       │ PK id            │
│ FK user_id      │       │ FK user_id       │
│    account_name │       │    title         │
│    account_no   │       │    message       │
│    account_type │       │    type          │
│    balance      │       │    is_read       │
│    status       │       │    created_at    │
│    created_at   │       └──────────────────┘
└─────────────────┘
```

#### 📝 Penjelasan Diagram ERD

Diagram di atas menggambarkan struktur database **Trapeza Bank** yang terdiri dari **4 tabel utama** yang saling berelasi:

**1. Tabel `users` (Tabel Master)**

Tabel `users` merupakan tabel utama yang menyimpan data pengguna aplikasi. Setiap user memiliki `id` unik sebagai **Primary Key**, serta menyimpan informasi login (`username`, `password`), identitas (`nama_lengkap`), saldo utama (`gold`), dan status akun. Tabel ini menjadi **pusat relasi** karena 3 tabel lainnya bergantung pada tabel ini melalui **Foreign Key**.

**2. Tabel `accounts` (Relasi 1:N dengan users)**

Tabel `accounts` menyimpan data rekening yang dimiliki user. Satu user dapat memiliki **banyak rekening** (relasi one-to-many), sehingga kolom `user_id` pada tabel accounts merupakan **Foreign Key** yang merujuk ke `users.id`. Setiap rekening memiliki nomor unik (`account_number`), nama custom (`account_name`), tipe rekening (SAVINGS/CHECKING/DEPOSIT), dan saldo tersendiri (`balance`).

**3. Tabel `transactions` (Relasi N:1 dengan users)**

Tabel `transactions` mencatat **riwayat semua transaksi** yang terjadi dalam sistem. Tabel ini memiliki **2 Foreign Key** yang keduanya merujuk ke tabel `users`:
- `from_user_id` → ID user **pengirim** (sumber dana)
- `to_user_id` → ID user **penerima** (tujuan dana)

Relasi ganda ini memungkinkan sistem mencatat transaksi **transfer antar user** dengan jelas. Untuk transaksi seperti top-up atau withdraw, salah satu kolom bisa bernilai NULL atau sama dengan user yang melakukan transaksi.

**4. Tabel `notifications` (Relasi 1:N dengan users)**

Tabel `notifications` menyimpan **notifikasi in-app** untuk setiap user. Kolom `user_id` merupakan Foreign Key yang menunjukkan pemilik notifikasi. Setiap user dapat memiliki **banyak notifikasi** (one-to-many). Notifikasi dibuat secara otomatis oleh sistem saat terjadi transaksi seperti transfer masuk, top-up berhasil, atau bonus diterima. Kolom `is_read` menandai apakah notifikasi sudah dibaca.

**Ringkasan Relasi:**

| Relasi | Tipe | Deskripsi |
|--------|------|-----------|
| users → accounts | 1:N | Satu user memiliki banyak rekening |
| users → notifications | 1:N | Satu user memiliki banyak notifikasi |
| users → transactions (from) | 1:N | Satu user bisa menjadi pengirim banyak transaksi |
| users → transactions (to) | 1:N | Satu user bisa menjadi penerima banyak transaksi |

### 2.2 Tabel Users

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT | ID unik |
| username | VARCHAR(255) | UNIQUE, NOT NULL | Username login |
| password | VARCHAR(255) | NOT NULL | Password |
| nama_lengkap | VARCHAR(255) | - | Nama tampilan |
| gold | INT | DEFAULT 1000 | Saldo utama |
| status_akun | VARCHAR(50) | DEFAULT 'Aktif' | Status |
| created_at | DATETIME | - | Waktu register |

### 2.3 Tabel Accounts

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT | ID unik |
| user_id | BIGINT | FK → users.id | Pemilik |
| account_number | VARCHAR(50) | UNIQUE | Nomor rekening |
| account_name | VARCHAR(255) | - | Nama rekening |
| account_type | VARCHAR(50) | - | SAVINGS/CHECKING/DEPOSIT |
| balance | INT | DEFAULT 0 | Saldo rekening |
| status | VARCHAR(20) | DEFAULT 'ACTIVE' | Status |
| created_at | DATETIME | - | Waktu dibuat |

### 2.4 Tabel Transactions

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT | ID unik |
| from_user_id | BIGINT | FK → users.id | Pengirim |
| to_user_id | BIGINT | FK → users.id | Penerima |
| amount | INT | NOT NULL | Jumlah |
| type | VARCHAR(50) | - | TRANSFER/TOPUP/WITHDRAW/DEPOSIT |
| description | VARCHAR(255) | - | Keterangan |
| created_at | DATETIME | - | Waktu transaksi |

### 2.5 Tabel Notifications

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| id | BIGINT | PK, AUTO_INCREMENT | ID unik |
| user_id | BIGINT | FK → users.id | Penerima |
| title | VARCHAR(255) | - | Judul notifikasi |
| message | TEXT | - | Isi notifikasi |
| type | VARCHAR(50) | - | SYSTEM/TRANSFER/BONUS |
| is_read | BOOLEAN | DEFAULT FALSE | Status baca |
| created_at | DATETIME | - | Waktu |

---

## 3. Teknologi yang Digunakan

### 3.1 Backend

| Komponen | Versi | Fungsi |
|----------|-------|--------|
| Java | 21 (LTS) | Bahasa pemrograman |
| Spring Boot | 4.0.1 | Framework REST API |
| Spring Data JPA | - | ORM & Repository |
| MySQL | 8.x | Database |
| Lombok | - | Reduce boilerplate |
| Springdoc OpenAPI | - | Swagger UI |
| Maven | - | Build tool |

### 3.2 Frontend

| Komponen | Fungsi |
|----------|--------|
| HTML5 | Struktur halaman |
| CSS3 | Styling (dark theme) |
| JavaScript ES6+ | Logic & fetch API |
| localStorage | Session management |

### 3.3 Konfigurasi (application.yaml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/trapeza_db?createDatabaseIfNotExist=true
    username: root
    password: 
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080
```

---

## 4. API Endpoints

Base URL: `http://localhost:8080/api/trapeza`

### 4.1 Authentication

| Method | Endpoint | Parameter | Fungsi |
|--------|----------|-----------|--------|
| POST | `/login` | username, password | Login |
| POST | `/register` | username, password, nama | Register |

### 4.2 Balance & Transactions

| Method | Endpoint | Parameter | Fungsi |
|--------|----------|-----------|--------|
| GET | `/balance` | username | Cek saldo |
| POST | `/topup` | username, amount | Top up |
| POST | `/transfer` | from, to, amount | Transfer |
| POST | `/withdraw` | username, amount | Tarik saldo |
| GET | `/history` | username, type? | Riwayat |

### 4.3 Accounts

| Method | Endpoint | Parameter | Fungsi |
|--------|----------|-----------|--------|
| GET | `/accounts` | username | List rekening |
| POST | `/accounts` | username, accountName, accountType | Buat rekening |
| POST | `/accounts/deposit` | username, accountId, amount | Setor |
| POST | `/accounts/withdraw` | username, accountId, amount | Tarik |

### 4.4 Notifications

| Method | Endpoint | Parameter | Fungsi |
|--------|----------|-----------|--------|
| GET | `/notifications` | username | List notifikasi |
| POST | `/notifications/read` | notificationId | Tandai dibaca |
| POST | `/notifications/read-all` | username | Tandai semua dibaca |

### 4.5 Contoh Response

**Login Success:**
```json
{
    "success": true,
    "message": "Login berhasil!",
    "user": {
        "id": 1,
        "username": "john",
        "namaLengkap": "John Doe",
        "gold": 1000
    }
}
```

**Transfer Success:**
```json
{
    "success": true,
    "message": "Transfer 100 GOLD ke jane berhasil!",
    "balance": 900,
    "user": { ... }
}
```

---

## 5. Arsitektur Aplikasi

### 5.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Port 3000)                 │
│         HTML + CSS + JavaScript + localStorage          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP (JSON)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     CONTROLLER                          │
│              TrapezaController.java                     │
│       @RestController @RequestMapping("/api/trapeza")   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      SERVICE                            │
│               TrapezaService.java                       │
│         Business Logic + @Transactional                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     REPOSITORY                          │
│    UserRepository, AccountRepository, etc.              │
│         extends JpaRepository<Entity, Long>             │
└─────────────────────────┬───────────────────────────────┘
                          │ JPA/Hibernate
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       DATABASE                          │
│                   MySQL (trapeza_db)                    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Struktur Folder

```
trapeza-api/
├── src/main/java/com/moe/trapeza_api/
│   ├── TrapezaApiApplication.java      ← Main class
│   ├── controller/
│   │   └── TrapezaController.java      ← 15+ endpoints
│   ├── service/
│   │   └── TrapezaService.java         ← Business logic
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── TransactionRepository.java
│   │   ├── AccountRepository.java
│   │   └── NotificationRepository.java
│   └── entity/
│       ├── User.java
│       ├── Transaction.java
│       ├── Account.java
│       └── Notification.java
│
├── frontend/
│   ├── index.html                      ← Login/Register
│   ├── dashboard.html                  ← Main App (SPA)
│   ├── css/
│   │   └── styles.css                  ← Dark theme styling
│   ├── js/
│   │   └── dashboard.js                ← All frontend logic
│   └── pages/
│       ├── home.html
│       ├── wallet.html
│       ├── history.html
│       └── profile.html
│
├── start.bat                           ← Start script
└── pom.xml                             ← Dependencies
```

---

## 6. Schematic Diagram

### 6.1 Diagram Arsitektur Sistem

Diagram berikut menjelaskan arsitektur keseluruhan sistem Trapeza Bank:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🖥️ CLIENT LAYER (Browser)                              │
│                                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ index.html  │  │ dashboard   │  │  wallet     │  │  history    │               │
│  │  (Login)    │  │   .html     │  │   .html     │  │   .html     │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │
│         │                │                │                │                       │
│         └────────────────┴────────┬───────┴────────────────┘                       │
│                                   │                                                 │
│                          ┌────────▼────────┐                                       │
│                          │  dashboard.js   │  ← localStorage (session)             │
│                          │  fetch() API    │                                        │
│                          └────────┬────────┘                                       │
└───────────────────────────────────┼─────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Request (JSON)
                                    │ Port: 8080
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ☕ BACKEND LAYER (Spring Boot)                             │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         🎮 CONTROLLER LAYER                                  │   │
│  │                                                                              │   │
│  │  TrapezaController.java                                                      │   │
│  │  ├── @PostMapping("/login")      → Autentikasi user                         │   │
│  │  ├── @PostMapping("/register")   → Registrasi user baru                     │   │
│  │  ├── @GetMapping("/balance")     → Cek saldo                                │   │
│  │  ├── @PostMapping("/topup")      → Top up saldo                             │   │
│  │  ├── @PostMapping("/transfer")   → Transfer ke user lain                    │   │
│  │  ├── @PostMapping("/withdraw")   → Tarik saldo                              │   │
│  │  ├── @GetMapping("/history")     → Riwayat transaksi                        │   │
│  │  ├── @GetMapping("/accounts")    → List rekening                            │   │
│  │  └── @GetMapping("/notifications") → Notifikasi                             │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐   │
│  │                         ⚙️ SERVICE LAYER                                     │   │
│  │                                                                              │   │
│  │  TrapezaService.java                                                         │   │
│  │  ├── login()           → Validasi credential                                │   │
│  │  ├── register()        → Buat user + bonus gold                             │   │
│  │  ├── topUp()           → Tambah saldo + create notification                 │   │
│  │  ├── transfer()        → Kurangi sender + tambah receiver + notif           │   │
│  │  ├── withdraw()        → Kurangi saldo + create notification                │   │
│  │  ├── createAccount()   → Buat rekening baru + generate account number       │   │
│  │  └── @Transactional    → Semua operasi DB atomic (rollback on error)        │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
│                                     │                                               │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐   │
│  │                         📦 REPOSITORY LAYER                                  │   │
│  │                                                                              │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │   │
│  │  │ UserRepository  │  │  Account        │  │ TransactionRepository       │  │   │
│  │  │ .findByUsername │  │  Repository     │  │ .findByFromUserIdOrToUserId │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │   │
│  │                                                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐    │   │
│  │  │         NotificationRepository.findByUserIdOrderByCreatedAtDesc     │    │   │
│  │  └─────────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                              │   │
│  │  Semua repository extends JpaRepository<Entity, Long>                        │   │
│  │  Spring Data JPA auto-generate query implementation                          │   │
│  └──────────────────────────────────┬──────────────────────────────────────────┘   │
└─────────────────────────────────────┼───────────────────────────────────────────────┘
                                      │
                                      │ JPA/Hibernate (ORM)
                                      │ JDBC Connection
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              🗄️ DATABASE LAYER (MySQL)                              │
│                                                                                     │
│                              Database: trapeza_db                                   │
│                              Port: 3306                                             │
│                                                                                     │
│  ┌───────────────┐    ┌────────────────┐    ┌──────────────────┐                   │
│  │    users      │◄───│   accounts     │    │   transactions   │                   │
│  │   (Master)    │    │  (1:N with     │    │   (History)      │                   │
│  │               │◄───│    users)      │    │                  │                   │
│  └───────────────┘    └────────────────┘    └──────────────────┘                   │
│         ▲                                                                           │
│         │                                                                           │
│  ┌──────┴──────────────────────────────────────────────────────┐                   │
│  │                      notifications                          │                   │
│  │                    (In-App Messages)                        │                   │
│  └─────────────────────────────────────────────────────────────┘                   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Penjelasan Alur Data

Diagram di atas menjelaskan bagaimana data mengalir dari **User Interface** hingga **Database**:

#### 🔹 Layer 1: Client Layer (Browser)
| Komponen | Fungsi |
|----------|--------|
| **index.html** | Halaman login/register |
| **dashboard.html** | Main app dengan SPA (Single Page Application) |
| **dashboard.js** | Mengelola fetch() ke API dan localStorage untuk session |
| **localStorage** | Menyimpan data user session (username, gold, dll) |

#### 🔹 Layer 2: Controller Layer
| Endpoint | HTTP Method | Fungsi |
|----------|-------------|--------|
| `/api/trapeza/login` | POST | Menerima request login, validasi credential |
| `/api/trapeza/transfer` | POST | Menerima request transfer, validasi amount |
| `/api/trapeza/balance` | GET | Return saldo user |

**Tugas Controller:**
- Menerima HTTP request dari frontend
- Parse parameter/body request
- Memanggil method di Service layer
- Return response JSON ke frontend

#### 🔹 Layer 3: Service Layer
| Method | Proses |
|--------|--------|
| `topUp()` | 1. Find user → 2. Tambah gold → 3. Save user → 4. Create transaction → 5. Create notification |
| `transfer()` | 1. Find sender & receiver → 2. Validate amount → 3. Kurangi sender → 4. Tambah receiver → 5. Create transaction → 6. Notif kedua user |

**Tugas Service:**
- Business logic / aturan bisnis
- Transaction management dengan `@Transactional`
- Koordinasi antar repository

#### 🔹 Layer 4: Repository Layer
```java
// Contoh: UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

**Tugas Repository:**
- Interface ke database
- Spring Data JPA auto-generate query
- Return Entity objects

#### 🔹 Layer 5: Database Layer
- **MySQL** menyimpan semua data persisten
- **Hibernate** (JPA implementation) mapping Java Entity ↔ SQL Table
- **Connection Pool** untuk efisiensi koneksi

### 6.3 Diagram Sequence (Transfer Flow)

Berikut adalah urutan proses saat user melakukan **transfer**:

```
┌─────┐          ┌──────────┐        ┌───────────┐        ┌────────────┐       ┌────────┐
│User │          │Frontend  │        │Controller │        │  Service   │       │Database│
└──┬──┘          └────┬─────┘        └─────┬─────┘        └──────┬─────┘       └───┬────┘
   │                  │                    │                     │                 │
   │ 1. Klik Transfer │                    │                     │                 │
   │─────────────────►│                    │                     │                 │
   │                  │                    │                     │                 │
   │                  │ 2. POST /transfer  │                     │                 │
   │                  │ {from,to,amount}   │                     │                 │
   │                  │───────────────────►│                     │                 │
   │                  │                    │                     │                 │
   │                  │                    │ 3. transfer()       │                 │
   │                  │                    │────────────────────►│                 │
   │                  │                    │                     │                 │
   │                  │                    │                     │ 4. findByUser() │
   │                  │                    │                     │────────────────►│
   │                  │                    │                     │                 │
   │                  │                    │                     │◄────────────────│
   │                  │                    │                     │ return users    │
   │                  │                    │                     │                 │
   │                  │                    │                     │ 5. save(users)  │
   │                  │                    │                     │────────────────►│
   │                  │                    │                     │                 │
   │                  │                    │                     │ 6. save(trx)    │
   │                  │                    │                     │────────────────►│
   │                  │                    │                     │                 │
   │                  │                    │                     │ 7. save(notif)  │
   │                  │                    │                     │────────────────►│
   │                  │                    │                     │                 │
   │                  │                    │◄────────────────────│                 │
   │                  │                    │   {success: true}   │                 │
   │                  │                    │                     │                 │
   │                  │◄───────────────────│                     │                 │
   │                  │   JSON Response    │                     │                 │
   │                  │                    │                     │                 │
   │◄─────────────────│                    │                     │                 │
   │ 8. Update UI     │                    │                     │                 │
   │    (alert sukses)│                    │                     │                 │
   │                  │                    │                     │                 │
```

### 6.4 Deployment Diagram

```
         ┌───────────────────────────────────────────────────────────────┐
         │                     LOCAL DEVELOPMENT                         │
         │                                                               │
         │   ┌─────────────────┐         ┌─────────────────┐            │
         │   │   Frontend      │         │    Backend      │            │
         │   │   (serve)       │ ──────► │  (Spring Boot)  │            │
         │   │   Port: 3000    │  HTTP   │   Port: 8080    │            │
         │   └─────────────────┘         └────────┬────────┘            │
         │                                        │                      │
         │                                        │ JDBC                 │
         │                                        ▼                      │
         │                               ┌─────────────────┐            │
         │                               │     MySQL       │            │
         │                               │   Port: 3306    │            │
         │                               │  (trapeza_db)   │            │
         │                               └─────────────────┘            │
         │                                                               │
         └───────────────────────────────────────────────────────────────┘
```

### 6.5 Ringkasan Komponen

| Layer | Teknologi | Port | File Utama |
|-------|-----------|------|------------|
| **Client** | HTML + JS + CSS | 3000 | dashboard.html, dashboard.js |
| **API** | Spring Boot | 8080 | TrapezaController.java |
| **Service** | Java | - | TrapezaService.java |
| **Repository** | Spring Data JPA | - | *Repository.java |
| **Database** | MySQL | 3306 | trapeza_db |

---

## 7. User Interface

### 6.1 Desain UI

Aplikasi menggunakan **dark theme** dengan aksen gold (#D4AF37).

### 6.2 Halaman Utama

| Komponen | Deskripsi |
|----------|-----------|
| **Header** | Avatar + Notification bell dengan badge |
| **Balance Card** | Saldo utama dengan format rupiah |
| **Quick Actions** | Cek, Top Up, Kirim, Tarik |
| **Recent Transactions** | 5 transaksi terakhir |
| **Bottom Navigation** | Home, Wallet, History, Profile |

### 6.3 Halaman Wallet

| Komponen | Deskripsi |
|----------|-----------|
| **Total Saldo** | Saldo gold utama |
| **Rekening Saya** | List rekening + tombol Setor/Tarik/Baru |
| **Form Setor** | Pilih rekening, input jumlah |
| **Form Tarik** | Pilih rekening, input jumlah |
| **Gold Balance** | Saldo dalam format GOLD |

---

## 7. Cara Menjalankan

### 7.1 Menggunakan start.bat

```
Double-click file start.bat
```

### 7.2 Manual

```bash
# Terminal 1: Backend
cd d:\trapeza-api\trapeza-api
.\mvnw spring-boot:run

# Terminal 2: Frontend
cd d:\trapeza-api\trapeza-api
npx -y serve ./frontend -l 3000
```

### 7.3 Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| http://localhost:3000 | Frontend |
| http://localhost:8080/swagger-ui.html | API Documentation |

---

## 8. Kesimpulan

Project Trapeza Bank berhasil mengimplementasikan:

1. ✅ **Backend REST API** dengan Spring Boot
2. ✅ **Frontend responsive** dengan dark theme
3. ✅ **Multi-rekening** dengan setor/tarik
4. ✅ **Notifikasi in-app** real-time
5. ✅ **Riwayat transaksi** dengan filter

### Pengembangan Selanjutnya

- [ ] Implementasi JWT Authentication
- [ ] Password hashing (bcrypt)
- [ ] PIN untuk transaksi
- [ ] Transfer antar rekening
- [ ] Export statement PDF

---

**— Akhir Laporan —**

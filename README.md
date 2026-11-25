# E-Wallet — ASP.NET Core Identity, JWT, RBAC & React Integration (Weekly 7)

E-Wallet Weekly 7 melanjutkan pengembangan sistem bisnis dari Weekly 6 dengan mengadopsi **ASP.NET Core Identity** untuk manajemen pengguna, **JWT Authentication** (Access Token + HttpOnly Refresh Token), **Role-Based Access Control (RBAC)** berbasis Authorization Policy, **Rate Limiting**, serta antarmuka frontend **React** yang terintegrasi mengikuti referensi desain dari Figma.

---

## Arsitektur & Struktur Proyek

**Clean / Layered Architecture** pada backend dan **Component-Based Architecture** pada frontend:

```text
koda-b1-weekly7/
├── backend/                          # ASP.NET Core Web API (.NET 9 / .NET 8)
│   ├── Ewallet.Domain/               # Entitas bisnis (Wallet, Transaction, WalletMutation, TopUpRequest, PaymentMethod, AuditLog)
│   ├── Ewallet.Application/          # DTOs, Service Interfaces, Business Logic, Security Policies & Roles
│   ├── Ewallet.Infrastructure/       # IdentityDbContext, ApplicationUser, EF Core Migrations, Seeder, Repositories
│   └── Ewallet.Api/                  # Controllers, Middlewares (Exception, CorrelationId, Timing), Program.cs, *.http
└── frontend/                         # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/                      # Axios/Fetch client dengan interceptor JWT & auto-refresh
    │   ├── context/                  # AuthContext (pengelolaan state autentikasi & role)
    │   ├── components/               # ProtectedRoute, RoleRoute, Navbar, Layout
    │   └── pages/                    # Login, Register, Customer (Dashboard, TopUp, Transfer, Activity, Profile), Admin (Users)
    └── package.json
```

---

## Prasyarat & Instalasi Dependency / Package

### Prasyarat Sistem
- **.NET SDK** (versi 8.0 atau 9.0 sesuai target framework project)
- **Database Server** (PostgreSQL / SQL Server sesuai provider EF Core yang digunakan)
- **Node.js** (v18+ LTS) dan **npm** (atau yarn/pnpm)
- **EF Core CLI Tool** (`dotnet-ef`)

### Instalasi Package Backend (.NET)
Masuk ke direktori root backend dan pulihkan seluruh NuGet packages:

```bash
cd backend
dotnet restore
```

Pastikan `dotnet-ef` sudah terpasang secara global untuk menjalankan perintah migrasi:

```bash
dotnet tool install --global dotnet-ef
# Jika sudah terpasang, perbarui dengan:
dotnet tool update --global dotnet-ef
```

*Package utama yang digunakan pada backend:*
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `Microsoft.EntityFrameworkCore.Design` & `Microsoft.EntityFrameworkCore.Tools`
- Database Provider EF Core (misal `Npgsql.EntityFrameworkCore.PostgreSQL` atau `Microsoft.EntityFrameworkCore.SqlServer`)
- `Swashbuckle.AspNetCore` / `Microsoft.AspNetCore.OpenApi`

### Instalasi Package Frontend (React)
Masuk ke direktori frontend dan pasang seluruh dependency npm:

```bash
cd frontend
npm install
```

*Package utama yang digunakan pada frontend:*
- `react`, `react-dom`, `react-router-dom` (Routing, `ProtectedRoute`, dan pemisahan rute `CUSTOMER` vs `ADMIN`)
- `axios` (HTTP Client dengan attachment header `Authorization: Bearer <token>` dan `withCredentials: true`)
- `lucide-react` / ikon UI & `tailwindcss` (Styling responsif mengikuti desain KodaWallet Figma)

---

## Konfigurasi Environment & Secret di Aplikasi

Demi keamanan, **password database, JWT Signing Key, dan password default Admin tidak disimpan di dalam repository Git**. Gunakan **User Secrets** (untuk Development) atau **Environment Variables**.

### Konfigurasi Backend (`dotnet user-secrets`)
Jalankan perintah berikut di dalam folder `Ewallet.Api`:

```bash
cd backend/Ewallet.Api

# Inisialisasi User Secrets
dotnet user-secrets init

# 1. Connection String Database
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=kodawallet_db;Username=postgres;Password=YOUR_DB_PASSWORD"

# 2. Konfigurasi JWT (SigningKeyBase64 wajib minimal 32 byte dalam format Base64 untuk HS256)
dotnet user-secrets set "Jwt:Issuer" "KodaWallet.Api"
dotnet user-secrets set "Jwt:Audience" "KodaWallet.Client"
dotnet user-secrets set "Jwt:AccessTokenMinutes" "15"
dotnet user-secrets set "Jwt:SigningKeyBase64" "BASE64_ENCODED_32_BYTE_SECRET_KEY_HERE"

# 3. Password Akun Seeding ADMIN
dotnet user-secrets set "Seed:AdminPassword" "AdminEwallet@123"
```

### Konfigurasi CORS (`appsettings.Development.json`)
Pastikan origin frontend React terdaftar pada bagian `Cors:AllowedOrigins`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173"
    ]
  }
}
```

### Konfigurasi Frontend (`frontend/.env`)
Buat file `.env` di dalam folder `frontend`:

```env
VITE_API_BASE_URL=http://localhost:5041/api/v1
```

---

## Migrasi Database & Seeding Data

Karena skema pengguna beralih dari tabel `Users` custom (Weekly 6) menjadi skema **ASP.NET Core Identity**, disarankan untuk melakukan reset database khusus environment Development/Testing sebelum menerapkan migrasi terbaru.

### Langkah Migrasi Manual via EF Core CLI
Jalankan dari folder `backend`:

```bash
# (Opsional) Reset database development jika masih menggunakan skema Weekly 6
dotnet ef database drop --project Ewallet.Infrastructure --startup-project Ewallet.Api --force

# Membuat migration baru (jika ada perubahan model tambahan)
dotnet ef migrations add RefactorToAspNetIdentity --project Ewallet.Infrastructure --startup-project Ewallet.Api

# Menerapkan seluruh migration ke database
dotnet ef database update --project Ewallet.Infrastructure --startup-project Ewallet.Api
```

### Otomatisasi Migration & Seeding saat Startup
Pada `Program.cs`, aplikasi memanggil ekstensi:

```csharp
await app.Services.InitializeDatabaseAsync();
```

Saat backend pertama kali dijalankan, metode ini secara otomatis:
1. Menerapkan pending EF Core migrations ke database.
2. Melakukan seeding Role standar (`ADMIN` dan `CUSTOMER`) melalui `RoleManager<IdentityRole<long>>`.
3. Melakukan seeding metode pembayaran (`PaymentMethods`) seperti Virtual Account / Transfer Bank.
4. Melakukan seeding akun default untuk keperluan Development & Testing menggunakan `UserManager<ApplicationUser>`:

| Role | Email | Password | Keterangan Wallet |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@ewallet.com` | Sesuai `Seed:AdminPassword` (misal `AdminEwallet@123`) | Tidak memiliki wallet transaksi |
| **CUSTOMER** | `rizal@example.com` / `rizallkadamong@gmail.com` | `Customer@123` | Wallet aktif (`W001`) |
| **CUSTOMER** | Akun Customer Tambahan (Budi Santoso) | `Customer@123` | Wallet aktif (`W002` / `W003`) |

---

## Cara Menjalankan Backend & Frontend React

### 1. Menjalankan Backend Web API
Buka terminal pertama dan jalankan proyek `Ewallet.Api`:

```bash
cd backend/Ewallet.Api
dotnet run
```

- **Base URL API:** `http://localhost:5041`
- **Swagger / OpenAPI UI (Development):** `http://localhost:5041/swagger`

### 2. Menjalankan Frontend React
Buka terminal kedua dan jalankan server development Vite:

```bash
cd frontend
npm run dev
```

- **URL Aplikasi Web:** `http://localhost:5173`

---

## Refactoring Database: `Users` ke `AspNetUsers`

Pada Weekly 7, pengelolaan identitas pengguna dipindahkan sepenuhnya dari tabel `Users` manual ke infrastruktur **ASP.NET Core Identity** untuk meningkatkan keamanan autentikasi dan standar manajemen hak akses.

### Ringkasan Perubahan Skema
1. **Entitas Pengguna (`ApplicationUser`):**
   - Menggantikan class `User` lama dengan `public class ApplicationUser : IdentityUser<long>`.
   - Memanfaatkan kolom bawaan Identity (`Id`, `UserName`, `NormalizedUserName`, `Email`, `NormalizedEmail`, `PhoneNumber`, `PasswordHash`, `SecurityStamp`, `ConcurrencyStamp`, `LockoutEnd`, dll.) tanpa menduplikasi kolom yang sudah ada.
   - Menambahkan properti domain khusus E-Wallet:
     - `FullName` (`string`): Nama lengkap pengguna.
     - `Status` (`UserStatus` / `string`): Status akun (`ACTIVE` atau `SUSPENDED`).
     - `CreatedAtUtc` & `UpdatedAtUtc` (`DateTime`): Audit waktu pembuatan dan pembaruan akun.
2. **Tabel Standar Identity:**
   - `DbContext` mewarisi `IdentityDbContext<ApplicationUser, IdentityRole<long>, long>` sehingga EF Core memetakan 7 tabel standar Identity:
     - `AspNetUsers` (menggantikan `Users`)
     - `AspNetRoles` (menyimpan role `ADMIN` dan `CUSTOMER`)
     - `AspNetUserRoles` (relasi many-to-many user dan role)
     - `AspNetUserClaims`, `AspNetRoleClaims`, `AspNetUserLogins`, `AspNetUserTokens`
3. **Pembaruan Relasi Foreign Key (FK) & Index:**
   - **`Wallets.UserId`:** Sekarang berelasi (`FK`) ke `AspNetUsers.Id` dengan hubungan **One-to-One** (satu pengguna memiliki tepat satu wallet) serta unique index pada `UserId`.
   - **`AuditLogs.ActorUserId`:** Diperbarui agar mereferensikan `AspNetUsers.Id` untuk mencatat identitas aktor (baik `CUSTOMER` maupun `ADMIN`) yang melakukan aksi penting seperti perubahan status akun.
   - Tabel bisnis lainnya (`Transactions`, `WalletMutations`, `PaymentMethods`, `TopUpRequests`) tetap dipertahankan dengan integritas referensial yang utuh.
4. **Alur Registrasi Atomik & Password Hashing:**
   - Password tidak lagi di-hash secara manual, melainkan dikelola oleh `UserManager<ApplicationUser>.CreateAsync(user, password)` menggunakan algoritma PBKDF2 standar Identity.
   - Pembuatan user, pemberian role `CUSTOMER`, dan pembuatan `Wallet` baru berstatus `ACTIVE` dengan saldo awal `Rp0` dibungkus dalam satu transaksi database (`IDbContextTransaction`) agar konsisten (rollback otomatis jika salah satu tahap gagal).

---

## Daftar Endpoint REST API

Base URL: `http://localhost:5041/api/v1`

### A. Authentication (`/auth`)
| Method | Endpoint | Akses / Policy | Rate Limit | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Publik | `auth-register` (5 req / 10 mnt) | Registrasi user baru (otomatis role `CUSTOMER` & Wallet `Rp0`) |
| `POST` | `/auth/login` | Publik | `auth-login` (5 req / 3 mnt) | Login & mendapatkan JWT `accessToken` + cookie `ewallet_refresh` |
| `GET` | `/auth/me` | Authenticated (`CUSTOMER`, `ADMIN`) | `default` | Mengambil profil ringkas & role sesi yang sedang login |
| `POST` | `/auth/refresh` | Publik (via Cookie) | `auth-refresh` (10 req / 2 mnt) | Memperbarui `accessToken` menggunakan HttpOnly cookie `ewallet_refresh` |
| `POST` | `/auth/logout` | Authenticated / Cookie | `default` | Revoke refresh token family & menghapus cookie `ewallet_refresh` |
| `POST` | `/auth/forgot-password` | Publik | `default` | Menghasilkan token reset password melalui Identity |
| `POST` | `/auth/reset-password` | Publik | `default` | Mengatur ulang password menggunakan token reset Identity |
| `POST` | `/auth/change-password` | Authenticated (`CUSTOMER`, `ADMIN`) | `default` | Mengubah password akun yang sedang aktif login |

### B. User Profile & Admin User Management (`/users`)
| Method | Endpoint | Akses / Policy | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | `CanAccessProfile` (`CUSTOMER`, `ADMIN`) | Melihat detail profil pengguna yang sedang login |
| `PUT` | `/users/profile` | `CanAccessProfile` (`CUSTOMER`, `ADMIN`) | Memperbarui `userName`, `fullName`, `email`, dan `phoneNumber` |
| `GET` | `/users/me/transactions` | `CanViewOwnTransactions` (`CUSTOMER`) | Melihat riwayat transaksi milik sendiri (`?page=1&pageSize=10`) |
| `GET` | `/users/me/mutations` | `CanViewOwnMutations` (`CUSTOMER`) | Melihat riwayat mutasi saldo wallet milik sendiri (`?page=1&pageSize=10`) |
| `GET` | `/users` | `CanManageUsers` (`ADMIN`) | Daftar seluruh pengguna dengan filter (`?search=&status=&role=&page=1&pageSize=10`) |
| `GET` | `/users/{id}` | `CanManageUsers` (`ADMIN`) | Melihat detail lengkap pengguna & informasi wallet berdasarkan ID |
| `PATCH` | `/users/{id}/status` | `CanManageUsers` (`ADMIN`) | Mengubah status pengguna (`ACTIVE` / `SUSPENDED`) + mencatat ke `AuditLogs` |

### C. Wallets, Top Up, Payment Methods & Transfers
| Method | Endpoint | Akses / Policy | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/payment-methods` | Authenticated (`CUSTOMER`, `ADMIN`) | Melihat daftar metode pembayaran tersedia (`?isActive=true`) |
| `GET` | `/wallets/me` | `CanManageOwnWallet` (`CUSTOMER`) | Melihat informasi wallet & saldo milik user yang sedang login |
| `GET` | `/wallets/lookup/{walletNumber}` | `CanTransfer` (`CUSTOMER`) | Mengecek data penerima berdasarkan nomor wallet (misal `W002`) sebelum transfer |
| `POST` | `/wallets/me/topup` | `CanTopUp` (`CUSTOMER`) | Membuat permintaan Top Up berstatus `PENDING` (saldo belum bertambah) |
| `POST` | `/wallets/topup/{topUpRequestId}/confirm` | `CanTopUp` (`CUSTOMER`) | Simulasi konfirmasi pembayaran Top Up (`PENDING` $\rightarrow$ `PAID`, saldo bertambah) |
| `GET` | `/topup-requests` | `CanViewAllTopUps` / `CanManageUsers` (`ADMIN`) | Melihat seluruh permintaan Top Up dari semua pengguna |
| `POST` | `/transfers` | `CanTransfer` (`CUSTOMER`) | Melakukan transfer saldo antar-wallet (validasi kepemilikan, saldo & concurrency) |

---

## Hak Akses Role (`CUSTOMER` vs `ADMIN`) & Authorization Policy

Sistem memisahkan hak akses secara ketat menggunakan **Authorization Policies** di ASP.NET Core:

| Authorization Policy | Role Diizinkan | Cakupan Fitur & Batasan Keamanan |
| :--- | :--- | :--- |
| `CanManageOwnWallet` | `CUSTOMER` | Melihat saldo dan detail wallet miliknya sendiri berdasarkan claim `sub` pada JWT. |
| `CanTopUp` | `CUSTOMER` | Membuat permintaan Top Up (`PENDING`) dan melakukan konfirmasi pembayaran simulasi. |
| `CanTransfer` | `CUSTOMER` | Melakukan lookup nomor wallet penerima dan transfer saldo dari wallet miliknya sendiri. |
| `CanViewOwnTransactions` | `CUSTOMER` | Melihat daftar transaksi masuk/keluar milik sendiri. |
| `CanViewOwnMutations` | `CUSTOMER` | Melihat catatan mutasi debit/kredit wallet milik sendiri. |
| `CanManageUsers` | `ADMIN` | Melihat daftar pengguna (search/filter/pagination), melihat detail user, dan mengubah status `ACTIVE`/`SUSPENDED`. **ADMIN dilarang mengakses atau memindahkan saldo wallet CUSTOMER.** |
| `CanViewAllTopUps` | `ADMIN` | Memantau seluruh riwayat permintaan Top Up di sistem untuk kebutuhan audit/operasional. |
| `CanAccessProfile` | `CUSTOMER`, `ADMIN` | Melihat dan memperbarui data profil akun masing-masing. |

---

## Keamanan Aplikasi & Konsep Arsitektur

1. **Perbedaan Authentication vs Authorization:**
   - **Authentication (Autentikasi)** adalah proses memverifikasi *siapa* pengguna yang mengakses sistem (melalui verifikasi email/password saat login dan validasi tanda tangan JWT pada setiap request).
   - **Authorization (Otorisasi)** adalah proses menentukan *apa yang boleh dilakukan* oleh pengguna yang sudah terautentikasi berdasarkan role dan policy miliknya (misalnya membedakan akses `CUSTOMER` dan `ADMIN`).

2. **Fungsi JWT (JSON Web Token):**
   - JWT berfungsi sebagai token identitas *stateless* yang ditandatangani secara kriptografis (`HMAC-SHA256`). Token ini membawa *claims* minimal seperti `sub` (User ID) dan `role`, sehingga server backend dapat mengenali pemilik request tanpa perlu menyimpan session di memori server dan mencegah pemalsuan `UserId` atau `SenderWalletId` dari sisi client.

3. **Alasan Penggunaan ASP.NET Core Identity:**
   - Menyediakan standar keamanan industri yang teruji untuk *password hashing* (PBKDF2 dengan salt unik), manajemen `SecurityStamp` (invalidasi sesi saat password berubah), normalisasi username/email, lockout akun, serta integrasi langsung dengan EF Core dan sistem Role/Claims.

4. **Alasan Frontend Role Protection Tidak Cukup Tanpa Authorization Backend:**
   - Kode React berjalan di browser pengguna sehingga dapat dimodifikasi melalui DevTools, maupun dilewati sepenuhnya dengan mengirim request langsung ke API menggunakan Postman, cURL, atau file `.http`. Oleh karena itu, penyembunyian menu/rute di React hanya berfungsi untuk pengalaman pengguna (UX), sedangkan penegakan keamanan sesungguhnya wajib dilakukan di backend melalui atribut `[Authorize(Policy = "...")]` dan pengecekan kepemilikan resource berbasis JWT `sub`.

5. **Strategi Penyimpanan Token di React & Pencegahan CSRF/XSS:**
   - **Access Token (JWT)** berumur pendek (misal 15 menit) disimpan di memori/state aplikasi React (atau sesi aktif) dan dikirim secara eksplisit melalui header `Authorization: Bearer <token>`, bukan melalui cookie otomatis, sehingga kebal terhadap serangan **CSRF** pada endpoint API.
   - **Refresh Token** disimpan pada cookie bertanda `HttpOnly`, `Secure`, dan `SameSite` (`ewallet_refresh`) sehingga tidak dapat diakses oleh JavaScript (melindungi dari pencurian token via **XSS**). Di sisi React, seluruh output teks dirender menggunakan JSX standar tanpa raw HTML (`dangerouslySetInnerHTML`) untuk mencegah XSS.

---

## Panduan Pengujian (Backend API & Frontend React)

### A. Pengujian Backend Web API (Menggunakan File `.http` / Swagger)
Gunakan file `.http` yang tersedia di proyek `Ewallet.Api` (melalui Visual Studio / VS Code REST Client) atau Swagger UI (`http://localhost:5041/swagger`):

1. **Alur Registrasi & Login:**
   - Jalankan `POST /api/v1/auth/register` dengan data pengguna baru $\rightarrow$ pastikan status `201 Created`, role otomatis `CUSTOMER`, dan wallet baru terbentuk dengan saldo `0`.
   - Jalankan `POST /api/v1/auth/login` menggunakan akun `CUSTOMER` (`rizal@example.com` / `Customer@123`) dan akun `ADMIN` (`admin@ewallet.com` / `AdminEwallet@123`) $\rightarrow$ pastikan menerima `accessToken`.
2. **Alur Bisnis E-Wallet (`CUSTOMER`):**
   - Panggil `GET /api/v1/wallets/me` untuk mendapatkan `id` wallet pengirim.
   - Panggil `POST /api/v1/wallets/me/topup` $\rightarrow$ pastikan status Top Up adalah `PENDING` dan saldo wallet **belum bertambah**.
   - Panggil `POST /api/v1/wallets/topup/{topUpRequestId}/confirm` $\rightarrow$ pastikan status berubah menjadi `PAID` dan saldo bertambah sesuai nominal.
   - Panggil `GET /api/v1/wallets/lookup/W002` untuk mendapatkan `walletId` penerima, lalu lakukan `POST /api/v1/transfers` $\rightarrow$ pastikan saldo pengirim berkurang, saldo penerima bertambah, dan tercatat di `/users/me/transactions` serta `/users/me/mutations`.
3. **Alur User Management (`ADMIN`):**
   - Panggil `GET /api/v1/users?search=&status=&role=&page=1&pageSize=10` dengan token `ADMIN`.
   - Panggil `PATCH /api/v1/users/3/status` dengan body `{"status": "SUSPENDED", "reason": "Pelanggaran kebijakan"}` $\rightarrow$ pastikan status berubah dan tercatat di tabel `AuditLogs`.
4. **Pengujian Negatif Keamanan, RBAC & Rate Limiting:**
   - **Tanpa Token (`401 Unauthorized`):** Akses `GET /api/v1/wallets/me` tanpa header `Authorization`.
   - **Lintas Role (`403 Forbidden`):**
     - Akses `GET /api/v1/users` menggunakan token `CUSTOMER`.
     - Akses `GET /api/v1/wallets/me` menggunakan token `ADMIN`.
   - **IDOR / Manipulasi Pemilik Wallet (`403 Forbidden` / `400 Bad Request`):**
     - Kirim `POST /api/v1/transfers` menggunakan token `CUSTOMER` A tetapi mengisi `senderWalletId` milik user lain.
   - **Rate Limiting (`429 Too Many Requests`):**
     - Kirim request `POST /api/v1/auth/login` lebih dari **5 kali dalam 3 menit** dari IP yang sama $\rightarrow$ pastikan request ke-6 mengembalikan status `429 Too Many Requests`.

### B. Pengujian Integrasi Frontend React
1. **Proteksi Rute & Redirect:**
   - Buka `http://localhost:5173/dashboard` dalam keadaan belum login $\rightarrow$ pastikan otomatis diarahkan ke halaman `/login`.
   - Login sebagai `CUSTOMER` lalu coba akses halaman admin (`/admin/users`) $\rightarrow$ pastikan muncul halaman **Akses Ditolak (403)** atau redirect ke dashboard customer.
2. **Pengujian UI Fitur Customer:**
   - Periksa tampilan **Dashboard** (nomor wallet, saldo terkini, status akun).
   - Lakukan **Top Up** melalui form $\rightarrow$ verifikasi status `PENDING` lalu klik konfirmasi pembayaran hingga saldo ter-update.
   - Lakukan **Transfer** $\rightarrow$ input nomor wallet tujuan, pastikan nama penerima muncul setelah lookup, isi nominal, konfirmasi, dan cek hasilnya muncul di halaman **Aktivitas / Riwayat Transaksi**.
3. **Pengujian UI Fitur Admin & Responsivitas:**
   - Login sebagai `ADMIN`, uji fitur pencarian nama/email, filter status (`ACTIVE`/`SUSPENDED`), buka detail pengguna, dan ubah status akun.
   - Uji tampilan pada ukuran layar mobile/tablet (DevTools Responsive Mode) untuk memastikan halaman Login/Register, Dashboard, Transfer, dan Aktivitas tetap rapi dan fungsional.
# Koperasi-app (modul peminjaman)

Modul pengelolaan pinjaman anggota, mulai dari pengajuan, tracking, hingga pelunasan cicilan


## Fitur Utama

- Pengajuan Pinjaman: Anggota dapat mengajukan pinjaman dengan berbagai pilihan jumlah dan tenor
- Sistem Persetujuan: Approval workflow dengan notifikasi dan tracking status 
- Manajemen Cicilan: Pembayaran cicilan berkala dengan sistem tracking otomatis
- Riwayat Transaksi: Pencatatan lengkap setiap transaksi pinjaman dan pembayaran
- Laporan & Analytics: Dashboard dengan statistik pinjaman aktif, tunggakan, dan performa pembayaran


## Teknologi yang Digunakan

**Backend**
- Laravel 11, PHP 8.3+
- Laravel Sanctum (Authentication)
- RESTful API dengan JSON response

**Frontend**
- React 18, Vite

**Database**
- MySQL 8.0+ 



## Prerequisites

Pastikan sudah terinstall sebelum memulai:

- PHP `8.3+`
- Composer
- Node.js `18+` & npm
- MySQL `8.0+` 
- Laravel `11`


## Cara Instalasi

### Backend (Laravel)

```bash
cd koperasi-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (React)

```bash
cd koperasi-frontend
npm install
npm run dev
```

## Cara Menjalankan

Buka **dua terminal** secara bersamaan:

```bash
# Terminal 1 — Backend
cd koperasi-backend && php artisan serve

# Terminal 2 — Frontend
cd koperasi-frontend && npm run dev
```

Akses aplikasi di `http://localhost:5173`

## Struktur Folder

### Backend - `koperasi-backend`

```
app/
├── Models/
│   ├── Loan.php              # Model pinjaman utama
│   ├── LoanApproval.php      # Riwayat persetujuan pinjaman
│   ├── LoanCicilan.php       # Detail cicilan & jadwal pembayaran
│   ├── User.php              # Model pengguna/anggota
│   └── ActivityLog.php       # Log aktivitas sistem
├── Http/Controllers/Api/
│   ├── LoanController.php            # CRUD & operasi pinjaman
│   ├── LoanApprovalController.php    # Approve/reject pinjaman
│   └── CicilanController.php         # Manajemen & update cicilan
├── Helpers/
│   └── ActivityLogHelper.php         # Helper untuk logging aktivitas
├── Traits/
│   └── LoanFormatting.php            # Trait untuk formatting data loan
└── Providers/
    └── AppServiceProvider.php        # Service provider aplikasi

database/
├── migrations/
│   └── 2026_01_19_022959_create_initial_koperasi_schema.php
├── seeders/
│   └── DatabaseSeeder.php            # Database seeder
└── sql/
    └── schema.sql                    # SQL schema dokumentasi

routes/
└── api.php                           # API routes pinjaman

storage/
└── logs/                             # Application logs
```

### Frontend - `koperasi-frontend`

```
├── views/
│   ├── dashboard/
│   │   └── Default/          # Dashboard default
│   ├── lead/                 # Modul pinjaman (loan)
│   │   └── loans/
│   │       ├── LeadLoan.jsx          # Daftar pengajuan pinjaman
│   │       └── LeadLoanDetail.jsx    # Detail pinjaman & cicilan
│   ├── master/               # Master data management
│   │   ├── product/          # Manajemen produk
│   │   └── users/            # Manajemen user/anggota
│   ├── transaction/          # Transaksi & pembayaran
│   │   └── stock/            # Manajemen stok
│   ├── pjtoko/               # Modul toko/penjualan
│   ├── pages/                # Halaman umum/utilities
│   ├── sample-page/          # Sample pages untuk referensi
│   └── utilities/            # Utility pages
├── components/
│   └── cards/                # Reusable card components
├── api/
│   ├── axios.js              # Konfigurasi HTTP client axios
│   └── menu.js               # Menu data struktur
├── layout/                   # Layout components (header, sidebar, dll)
└── routes/                   # Route configuration
```

## Alur Pinjaman (Logika Bisnis)

### 1. Pengajuan Pinjaman
- Anggota mengakses menu **Lead → Loans → LeadLoan.jsx**
- Form meminta: jumlah pinjaman, tenor (bulan), tujuan, metode pembayaran
- Data dikirim ke `POST /api/loans`
- Sistem menyimpan dengan status `PENDING` di tabel `loans`
- Notifikasi dikirim ke admin untuk review

### 2. Proses Verifikasi & Approval
- Admin membuka detail pinjaman melalui `LeadLoanDetail.jsx`
- Admin melakukan verifikasi kelayakan anggota (riwayat kredit, income, dll)
- Hasil keputusan:
  - ✅ **APPROVED** → `PATCH /api/loans/{id}/approve`
  - ❌ **REJECTED** → `PATCH /api/loans/{id}/reject`
- Status berubah dari `PENDING` → `APPROVED` atau `REJECTED`

### 3. Pencairan Dana (Post-Approval)
- Pinjaman disetujui → Status otomatis menjadi `ACTIVE`
- Sistem membuat jadwal cicilan otomatis berdasarkan tenor

### 4. Manajemen Cicilan & Jadwal Pembayaran
- Setiap cicilan tersimpan di tabel `loan_cicilan` dengan detail:
  - Nomor cicilan, tanggal pembayaran, nominal cicilan
  - Status: `pending` · `paid` · `postponed`
- Anggota dapat melihat jadwal lengkap di `LeadLoanDetail`
- PJ Toko memantau cicilan yang akan jatuh tempo

### 5. Pencatatan Pembayaran Cicilan
- Anggota melakukan pembayaran via transfer, tunai, dll
- **PJ Toko** mengkonfirmasi pembayaran yang diterima
- Update status cicilan → `paid`: `PATCH /api/loans/{loan}/cicilan/{cicilan}`
- Riwayat pembayaran dapat dilihat di halaman detail pinjaman

### 6. Permohonan Penundaan (Postponement)
- Jika anggota kesulitan membayar, bisa mengajukan penundaan
- `PATCH /api/loans/{id}/postpone-request` — Ajukan permohonan
- Admin melakukan review:
  - ✅ `PATCH /api/loans/{id}/postpone-approve` — Setujui
  - ❌ `PATCH /api/loans/{id}/postpone-reject` — Tolak
- Jadwal cicilan disesuaikan jika permohonan disetujui

### 7. Laporan & Analytics
- Admin melihat statistik via `GET /api/loans/report/data`
- Data: total pinjaman aktif, tunggakan, performa pembayaran, dll
- Filter berdasarkan member: `GET /api/loans/filter-members`

### API Endpoints
### Loans — Pinjaman & Approval

#### **1. Pengajuan & CRUD**
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/loans` | Daftar semua pengajuan pinjaman |
| `POST` | `/api/loans` | Buat pengajuan pinjaman baru |
| `GET` | `/api/loans/{id}` | Detail pinjaman beserta cicilan |
| `DELETE` | `/api/loans/{id}` | Hapus pengajuan (hanya status **PENDING**) |

#### **2. Approval Workflow**
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `PATCH` | `/api/loans/{id}/approve` | Setujui pengajuan pinjaman |
| `PATCH` | `/api/loans/{id}/reject` | Tolak pengajuan pinjaman |

#### **3. Cicilan Management**
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `PATCH` | `/api/loans/{loan}/cicilan/{cicilan}` | Update status cicilan (mark as paid, dll) |

#### **4. Postponement (Penundaan)**
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `PATCH` | `/api/loans/{id}/postpone-request` | Ajukan permohonan penundaan |
| `PATCH` | `/api/loans/{id}/postpone-approve` | Setujui permohonan penundaan |
| `PATCH` | `/api/loans/{id}/postpone-reject` | Tolak permohonan penundaan |

#### **5. Reports & Filters**
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/loans/report/data` | Laporan & statistik pinjaman |
| `GET` | `/api/loans/filter-members` | Daftar member untuk kebutuhan filter |


### Legacy Routes *(Backward Compatibility)*

Alias dari routes utama — dipertahankan untuk kompatibilitas frontend lama.

| Method | Legacy Endpoint | Alias dari |
|:---|:---|:---|
| `GET` | `/api/submissions` | `GET /api/loans` |
| `POST` | `/api/submissions` | `POST /api/loans` |
| `GET` | `/api/submissions/{id}` | `GET /api/loans/{id}` |

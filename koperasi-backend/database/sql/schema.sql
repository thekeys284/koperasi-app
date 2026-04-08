SET FOREIGN_KEY_CHECKS=0;

-- categories
CREATE TABLE IF NOT EXISTS `categories` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- units
CREATE TABLE IF NOT EXISTS `units` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- products
CREATE TABLE IF NOT EXISTS `products` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED,
  unit_id BIGINT UNSIGNED,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  detail TEXT,
  current_selling_price DECIMAL(12,2) DEFAULT 0.00,
  min_stock INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE INDEX idx_products_name ON products(name);

-- konversi unit
CREATE TABLE IF NOT EXISTS `unit_conversions`(
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  from_unit_id BIGINT UNSIGNED NOT NULL, -- Misal: ID untuk 'Lusin'
  to_unit_id BIGINT UNSIGNED NOT NULL,   -- Misal: ID untuk 'PCS'
  multiplier INT NOT NULL,               -- Misal: 12
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (from_unit_id) REFERENCES units(id),
  FOREIGN KEY (to_unit_id) REFERENCES units(id)
) ENGINE=InnoDB;

-- price logs
CREATE TABLE IF NOT EXISTS `price_logs` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  old_price DECIMAL(12,2) NOT NULL,
  new_price DECIMAL(12,2) NOT NULL,
  change_type ENUM('SELLING_PRICE','PURCHASE_PRICE') NOT NULL,
  reason VARCHAR(255) NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- stock batches
CREATE TABLE IF NOT EXISTS `stock_batches` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  initial_qty INT NOT NULL,
  remaining_qty INT NOT NULL,
  expiry_date DATE NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_batches_fifo ON stock_batches(product_id, remaining_qty, received_at);
CREATE INDEX idx_batches_fefo ON stock_batches(product_id, remaining_qty, expiry_date);

-- stock adjustment
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  batch_id BIGINT UNSIGNED NULL,
  adjustment_qty INT NOT NULL,
  type ENUM('DAMAGED', 'LOST', 'EXPIRED', 'CORRECTION') NOT NULL,
  notes TEXT NULL, -- Catatan tambahan
  adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES stock_batches(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- payment methods
CREATE TABLE IF NOT EXISTS `payment_methods` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- sales transaction
CREATE TABLE IF NOT EXISTS `sales` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  cashier_id BIGINT UNSIGNED NOT NULL,
  total_bill DECIMAL(12,2) DEFAULT 0.00,
  total_discount DECIMAL(12,2) DEFAULT 0.00,
  payment_method_id BIGINT UNSIGNED NOT NULL,
  payment_status ENUM('PAID', 'UNPAID', 'PARTIAL') DEFAULT 'PAID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (cashier_id) REFERENCES users(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
) ENGINE=InnoDB;
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- sale item
CREATE TABLE IF NOT EXISTS `sale_items` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sale_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  batch_id BIGINT UNSIGNED NOT NULL,
  qty INT NOT NULL,
  normal_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  final_price DECIMAL(12,2) NOT NULL,
  hpp_at_sale DECIMAL(12,2) NOT NULL,
  item_profit DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES stock_batches(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- debts (Piutang Toko)
CREATE TABLE IF NOT EXISTS `debts` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  sale_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  total_debt DECIMAL(12,2) NOT NULL,
  remaining_debt DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('UNPAID', 'PARTIAL', 'PAID', 'BAD_DEBT') DEFAULT 'UNPAID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);

-- debt payments (Pembayaran Piutang Toko)
CREATE TABLE IF NOT EXISTS `debt_payments` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  debt_id BIGINT UNSIGNED NOT NULL,
  -- Siapa yang melakukan input/update data ini (PJ Toko/Admin)
  user_id BIGINT UNSIGNED NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
-- Index untuk mempermudah pencarian pembayaran piutang
CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_payment_date ON debt_payments(payment_date);

-- submissions (Pengajuan Pinjaman)
CREATE TABLE IF NOT EXISTS `submissions` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL, -- Siapa yang mengajukan
  type ENUM('Konsumtif', 'Produktif') NOT NULL, -- Jenis pinjaman (Pinjaman Uang atau Barang)
  amount_requested DECIMAL(12,2) NOT NULL, -- Jumlah yang dipinjam
  tenor_months INT NOT NULL, -- Jangka waktu (bulan)
  start_date DATE NOT NULL, -- Tanggal mulai pembayaran
  reason TEXT, -- Alasan peminjaman
  -- Tracking Persetujuan PJ Peminjaman
  pj_id BIGINT UNSIGNED NULL, -- Siapa PJ yang memeriksa
  pj_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  pj_note TEXT NULL, -- Alasan jika ditolak oleh PJ
  pj_action_at TIMESTAMP NULL,
  -- Tracking Persetujuan Ketua Koperasi
  chairman_id BIGINT UNSIGNED NULL, -- Siapa Ketua yang memeriksa
  chairman_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  chairman_note TEXT NULL, -- Alasan jika ditolak oleh Ketua
  chairman_action_at TIMESTAMP NULL,
  -- Status Akhir Pengajuan
  final_status ENUM('WAITING', 'ON_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'WAITING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pj_id) REFERENCES users(id),
  FOREIGN KEY (chairman_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- loans (Pengajuan Pinjaman)
CREATE TABLE IF NOT EXISTS loans (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL, -- Foreign Key ke tabel User
  jenis_pinjaman TINYINT(1) NOT NULL, -- 0 -> Konsumtif, 1 -> Produktif
  jumlah_pinjaman DECIMAL(15,2) NOT NULL, -- Total uang yang dipinjam
  lama_pembayaran INT NOT NULL, -- Tenor (misal: 6, 12, 24 bulan)
  bulan_potong_gaji VARCHAR(255) NULL,
  file_path VARCHAR(255) NULL,
  status_pengajuan ENUM('pending', 'disetujui_ketua', 'pending_pengajuan', 'rejected', 'paid') DEFAULT 'pending',
  tanggal_mulai_cicilan DATE NOT NULL, -- Waktu yang ditentukan user untuk mulai periode pembayaran
  tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Kapan user klik tombol "ajukan"
  tgl_acc_ketua1 TIMESTAMP NULL, -- Waktu saat ketua 1 melakukan approval
  tgl_acc_ketua2 TIMESTAMP NULL, -- Waktu saat ketua 2 melakukan approval
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- loan_cicilan (Cicilan)
CREATE TABLE IF NOT EXISTS loan_cicilan (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  loans_id BIGINT UNSIGNED NOT NULL, -- Foreign Key ke tabel loans
  tanggal_pembayaran DATE NOT NULL, -- Tanggal untuk pemotongan tukin
  nominal DECIMAL(15,2) NOT NULL, -- Jumlah Potongan
  status_pembayaran ENUM('pending', 'paid') DEFAULT 'pending',
  cicilan INT NOT NULL, -- Cicilan keberapa (1, 2, 3...)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loans_id) REFERENCES loans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- activity_logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  -- Gunakan BIGINT UNSIGNED agar sinkron dengan users(id)
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

  -- Judul singkat aktivitas, misal: "Penjualan Baru", "Update Harga"
  title VARCHAR(100) NOT NULL,

  -- Detail lengkapnya, misal: "Admin Budi mengubah harga Indomie dari 3000 ke 3500"
  message TEXT NOT NULL,

  -- User yang melakukan aktivitas
  user_id BIGINT UNSIGNED NOT NULL,

  -- Icon untuk tampilan di Next.js, misal: 'shopping-cart', 'user-plus', 'alert-circle'
  icon VARCHAR(50) DEFAULT 'info',

  -- Warna icon di UI (opsional, tapi bagus untuk Next.js), misal: 'success', 'danger', 'warning'
  status_color VARCHAR(20) DEFAULT 'primary',

  -- Gunakan TIMESTAMP agar konsisten dengan tabel lainnya
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexing untuk mempercepat loading dashboard
CREATE INDEX idx_logs_created_at ON activity_logs(created_at);


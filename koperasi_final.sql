-- ==========================================================
-- RETAIL MINIMARKET DATABASE
-- FIFO, FEFO & PRICE HISTORY
-- SAFE RE-RUN SCRIPT (NO CREATE DATABASE)
-- ==========================================================

SET FOREIGN_KEY_CHECKS=0;

-- ==========================================================
-- 1. USERS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `satker` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('user','operator','admin') NOT NULL,
  `limit` int DEFAULT 0,
  `limit_total` int DEFAULT 0,
  `profile_picture` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 2. CATEGORIES
-- ==========================================================
CREATE TABLE IF NOT EXISTS `categories` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 3. UNITS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `units` (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  unit_name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 4. PRODUCTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `products` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  product_detail VARCHAR(150),
  current_selling_price DECIMAL(12,2) DEFAULT 0.00,
  min_stock INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- ==========================================================
-- 5. STOCK BATCHES
-- ==========================================================
CREATE TABLE IF NOT EXISTS `stock_batches` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  purchase_price DECIMAL(12,2) NOT NULL,
  initial_qty INT NOT NULL,
  remaining_qty INT NOT NULL,
  expiry_date DATE,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX (expiry_date),
  INDEX (received_at)
) ENGINE=InnoDB;

-- ==========================================================
-- 6. PRICE LOGS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `price_logs` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2),
  change_type ENUM('SELLING_PRICE','PURCHASE_PRICE') NOT NULL,
  reason VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ==========================================================
-- 7. SALES
-- ==========================================================
CREATE TABLE IF NOT EXISTS `sales` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  total_bill DECIMAL(12,2) DEFAULT 0.00,
  total_discount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 8. SALE ITEMS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `sale_items` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_id INT NOT NULL,
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

-- ==========================================================
-- 9. STOCK ADJUSTMENTS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  batch_id INT NOT NULL,
  adjustment_type ENUM('SHRINKAGE','DAMAGE','GIFT','CORRECTION') NOT NULL,
  qty_change INT NOT NULL,
  loss_value DECIMAL(12,2),
  adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  FOREIGN KEY (batch_id) REFERENCES stock_batches(id)
) ENGINE=InnoDB;

-- ==========================================================
-- 10. ACTIVITY LOGS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `activity_logs` (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  message_text VARCHAR(255) NOT NULL,
  message_summary VARCHAR(255) NOT NULL,
  role ENUM('admin','operator','user') NOT NULL,
  user_id INT NOT NULL,
  message_icon VARCHAR(50) NOT NULL,
  message_date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ==========================================================
-- 11. SUBMISSIONS
-- ==========================================================
CREATE TABLE IF NOT EXISTS `submissions` (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  loan_type TEXT NOT NULL,
  load_date TEXT,
  loan_amount TEXT NOT NULL,
  loan_duration TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status VARCHAR(255),
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ==========================================================
-- DUMMY DATA
-- ==========================================================

INSERT IGNORE INTO users (id, full_name, username, email, satker, password, role)
VALUES
(1,'Admin Minimarket','admin','admin@mini.local','Pusat','admin123','admin'),
(2,'Operator Toko','operator','operator@mini.local','Cabang A','operator123','operator'),
(3,'User Biasa','user1','user1@mini.local','Cabang A','user123','user');

INSERT IGNORE INTO categories (id, category_name, description)
VALUES
(1,'Makanan','Produk makanan dan minuman'),
(2,'Non Makanan','Produk kebutuhan harian');

INSERT IGNORE INTO units (id, unit_name)
VALUES
(1,'PCS'),(2,'BOX'),(3,'PACK');

INSERT IGNORE INTO products
(id, category_id, barcode, product_name, product_detail, current_selling_price)
VALUES
(1,1,'899100100001','Indomie Goreng','Mi instan',3500),
(2,1,'899100100002','Aqua 600ml','Air mineral',4000),
(3,2,'899200200001','Lifebuoy','Sabun mandi',5000);

INSERT IGNORE INTO stock_batches
(id, product_id, purchase_price, initial_qty, remaining_qty, expiry_date)
VALUES
(1,1,2500,100,100,'2026-01-01'),
(2,2,3000,50,50,'2025-12-01'),
(3,3,3500,80,80,NULL);

INSERT IGNORE INTO price_logs
(product_id, old_price, new_price, change_type, reason)
VALUES
(1,3000,3500,'SELLING_PRICE','Penyesuaian harga');

INSERT IGNORE INTO sales
(id, invoice_number, total_bill)
VALUES
(1,'INV-001',7000);

INSERT IGNORE INTO sale_items
(sale_id, product_id, batch_id, qty, normal_price, final_price, hpp_at_sale, item_profit)
VALUES
(1,1,1,2,3500,7000,2500,2000);

INSERT IGNORE INTO activity_logs
(message_text, message_summary, role, user_id, message_icon)
VALUES
('Transaksi berhasil','Penjualan INV-001','operator',2,'shopping-cart');

INSERT IGNORE INTO submissions
(loan_type, loan_amount, loan_duration, status, user_id)
VALUES
('Pinjaman Darurat','1000000','12 Bulan','PENDING',3);

SET FOREIGN_KEY_CHECKS=1;

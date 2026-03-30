-- 1. NONAKTIFKAN PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=0;

-- 2. TRUNCATE TABLES SESUAI DEPENDENCY
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE loan_recap_items;
TRUNCATE TABLE loans;
TRUNCATE TABLE submissions;
TRUNCATE TABLE debt_payments;
TRUNCATE TABLE debts;
TRUNCATE TABLE sale_items;
TRUNCATE TABLE sales;
TRUNCATE TABLE stock_adjustments;
TRUNCATE TABLE stock_batches;
TRUNCATE TABLE price_logs;
TRUNCATE TABLE unit_conversions;
TRUNCATE TABLE products;
TRUNCATE TABLE payment_methods;
TRUNCATE TABLE units;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE password_reset_tokens;

-- 3. RESET AUTO_INCREMENT
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE units AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE unit_conversions AUTO_INCREMENT = 1;
ALTER TABLE stock_batches AUTO_INCREMENT = 1;
ALTER TABLE stock_adjustments AUTO_INCREMENT = 1;
ALTER TABLE sales AUTO_INCREMENT = 1;
ALTER TABLE sale_items AUTO_INCREMENT = 1;
ALTER TABLE debts AUTO_INCREMENT = 1;
ALTER TABLE debt_payments AUTO_INCREMENT = 1;
ALTER TABLE submissions AUTO_INCREMENT = 1;
ALTER TABLE loans AUTO_INCREMENT = 1;
ALTER TABLE loan_recap_items AUTO_INCREMENT = 1;
ALTER TABLE activity_logs AUTO_INCREMENT = 1;
ALTER TABLE payment_methods AUTO_INCREMENT = 1;
ALTER TABLE price_logs AUTO_INCREMENT = 1;

-- 4. MASTER DATA: USERS
INSERT INTO users (name, email, username, password, role, created_at, updated_at) VALUES
('Admin Utama', 'admin@koperasi.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW()),
('Siti Kasir', 'siti.kasir@koperasi.com', 'siti', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator', NOW(), NOW()),
('Budi PJ Toko', 'budi.toko@koperasi.com', 'budi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pj_toko', NOW(), NOW()),
('Agus Ketua Koperasi', 'agus.ketua@koperasi.com', 'agus', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ketua', NOW(), NOW()),
('Andi Anggota', 'andi.anggota@gmail.com', 'andi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW());

-- 5. MASTER DATA: CATEGORIES & UNITS
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Sembako', 'Kebutuhan pokok pangan', NOW(), NOW()),
('Alat Tulis', 'Keperluan kantor dan sekolah', NOW(), NOW());

INSERT INTO units (name, created_at, updated_at) VALUES
('PCS', NOW(), NOW()),
('LUSIN', NOW(), NOW()),
('DUS', NOW(), NOW());

-- 6. PAYMENT METHODS
INSERT INTO payment_methods (name, description, created_at) VALUES
('Tunai', 'Pembayaran cash di tempat', NOW()),
('QRIS', 'Pembayaran digital barcode', NOW()),
('Tempo', 'Potong gaji bulan depan', NOW());

-- 7. PRODUCTS & UNIT CONVERSIONS
INSERT INTO products (category_id, unit_id, barcode, name, detail, current_selling_price, min_stock, created_at, updated_at) VALUES
(1, 1, '8991234567', 'Indomie Goreng', 'Indomie rasa original per bungkus', 3500.00, 20, NOW(), NOW()),
(2, 1, '8999876543', 'Buku Tulis Sidu', 'Buku tulis isi 38 lembar', 5000.00, 10, NOW(), NOW());

INSERT INTO unit_conversions (product_id, from_unit_id, to_unit_id, multiplier) VALUES
(1, 3, 1, 40),
(2, 2, 1, 12);

-- 8. STOCK BATCHES & PRICE LOGS
INSERT INTO stock_batches (product_id, purchase_price, initial_qty, remaining_qty, received_at) VALUES
(1, 2800.00, 40, 10, '2026-03-01 08:00:00'),
(1, 3000.00, 40, 40, '2026-03-10 09:00:00');

INSERT INTO price_logs (product_id, user_id, old_price, new_price, change_type, reason, changed_at) VALUES
(1, 1, 3200.00, 3500.00, 'SELLING_PRICE', 'Kenaikan dari supplier', NOW());

-- 9. STOCK ADJUSTMENTS
INSERT INTO stock_adjustments (user_id, product_id, batch_id, adjustment_qty, type, notes, adjusted_at) VALUES
(3, 1, 1, -2, 'DAMAGED', 'Plastik pembungkus robek', NOW());

-- 10. SALES & SALE ITEMS
INSERT INTO sales (invoice_number, user_id, cashier_id, total_bill, payment_method_id, payment_status, created_at, updated_at) VALUES
('INV-20260315-001', 5, 2, 52500.00, 3, 'UNPAID', NOW(), NOW());

INSERT INTO sale_items (sale_id, product_id, batch_id, qty, normal_price, final_price, hpp_at_sale, item_profit, created_at, updated_at) VALUES
(1, 1, 1, 8, 3500.00, 28000.00, 2800.00, 5600.00, NOW(), NOW()),
(1, 1, 2, 7, 3500.00, 24500.00, 3000.00, 3500.00, NOW(), NOW());

-- 11. DEBTS & DEBT PAYMENTS
INSERT INTO debts (sale_id, user_id, total_debt, remaining_debt, due_date, status, created_at, updated_at) VALUES
(1, 5, 52500.00, 52500.00, '2026-03-25', 'UNPAID', NOW(), NOW());

INSERT INTO debt_payments (debt_id, user_id, amount_paid, payment_date, payment_status, note, created_at) VALUES
(1, 1, 20000.00, '2026-03-20', 'SUCCESS', 'Bayar cash sebagian', NOW());

-- 12. SUBMISSIONS, LOANS, & LOAN RECAP
-- INSERT INTO submissions (user_id, type, amount_requested, tenor_months, reason, pj_status, chairman_status, final_status, created_at, updated_at) VALUES
-- (5, 'Konsumtif', 1000000.00, 5, 'Biaya perbaikan atap rumah', 'APPROVED', 'APPROVED', 'APPROVED', NOW(), NOW());
INSERT INTO submissions (
  user_id, type, amount_requested, tenor_months, 
  start_date, -- Tambahkan kolom ini
  reason, pj_status, pj_action_at, 
  chairman_status, chairman_action_at, 
  final_status, created_at, updated_at
) VALUES (
  5, 'Konsumtif', 1000000.00, 5, 
  '2026-04-01', -- Nilai untuk start_date
  'Biaya perbaikan atap rumah', 'APPROVED', NOW(), 
  'APPROVED', NOW(), 
  'APPROVED', NOW(), NOW()
);

INSERT INTO loans (submission_id, user_id, total_loan, remaining_loan, monthly_installment, start_date, end_date, created_at) VALUES
(1, 5, 1000000.00, 1000000.00, 200000.00, '2026-04-01', '2026-08-01', NOW());

INSERT INTO loan_recap_items (loan_id, recap_month, recap_year, amount_to_pay, payment_status, created_at) VALUES
(1, 4, 2026, 200000.00, 'PENDING', NOW());

-- 13. ACTIVITY LOGS
INSERT INTO activity_logs (title, message, user_id, icon, status_color, created_at) VALUES
('Stok Masuk', 'Budi PJ Toko menginput stok Indomie sebanyak 40 Dus', 3, 'package', 'success', NOW()),
('Persetujuan Pinjaman', 'Ketua Koperasi menyetujui pinjaman Andi senilai 1.000.000', 4, 'check-circle', 'primary', NOW());

-- 14. AKTIFKAN KEMBALI PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=1;
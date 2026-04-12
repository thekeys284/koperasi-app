-- 1. NONAKTIFKAN PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=0;

-- 2. TRUNCATE TABLES SESUAI DEPENDENCY (anak dulu, baru induk)
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE loan_cicilan;
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
ALTER TABLE loan_cicilan AUTO_INCREMENT = 1;
ALTER TABLE activity_logs AUTO_INCREMENT = 1;
ALTER TABLE payment_methods AUTO_INCREMENT = 1;
ALTER TABLE price_logs AUTO_INCREMENT = 1;

-- 4. MASTER DATA: USERS
INSERT INTO users (name, email, username, password, role, created_at, updated_at) VALUES
('Admin Utama', 'admin@koperasi.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW()),
('Siti Kasir', 'siti.kasir@koperasi.com', 'siti', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator', NOW(), NOW()),
('Budi PJ Toko', 'budi.toko@koperasi.com', 'budi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pj_toko', NOW(), NOW()),
('Agus Ketua Koperasi', 'agus.ketua@koperasi.com', 'agus', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ketua', NOW(), NOW()),
('Andi Anggota', 'andi.anggota@gmail.com', 'andi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Rina Anggota', 'rina.anggota@koperasi.com', 'rina', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Dedi Anggota', 'dedi.anggota@koperasi.com', 'dedi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Nia Anggota', 'nia.anggota@koperasi.com', 'nia', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW()),
('Fajar Anggota', 'fajar.anggota@koperasi.com', 'fajar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW());

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

-- 12. SUBMISSIONS, LOANS, & LOAN CICILAN
INSERT INTO submissions (
  user_id, type, amount_requested, tenor_months,
  start_date,
  reason, pj_status, pj_action_at,
  chairman_status, chairman_action_at,
  final_status, created_at, updated_at
) VALUES (
  5, 'Konsumtif', 1000000.00, 5,
  '2026-04-01',
  'Biaya perbaikan atap rumah', 'APPROVED', NOW(),
  'APPROVED', NOW(),
  'APPROVED', NOW(), NOW()
);


INSERT INTO loans (id, user_id, jenis_pinjaman, jumlah_pinjaman, lama_pembayaran, bulan_potong_gaji, file_path, status_pengajuan, reason, postpone_cicilan_id, tanggal_mulai_cicilan, tanggal_pengajuan, tgl_acc_pj, pj_id, tgl_acc_ketua, ketua_id) VALUES
(1, 6, 0, 3000000.00, 6, 'Maret', NULL, 'disetujui_ketua', NULL, NULL, '2026-06-01', '2026-03-20', '2026-03-21 09:00:00', 3, '2026-03-22 10:00:00', 4),
(2, 7, 1, 4500000.00, 12, 'April', NULL, 'disetujui_ketua', NULL, NULL, '2026-06-10', '2026-03-21', '2026-03-22 09:00:00', 3, '2026-03-23 10:00:00', 4),
(3, 8, 0, 2500000.00, 5, 'April', NULL, 'pending_pengajuan', NULL, NULL, '2026-04-01', '2026-03-22', '2026-03-23 11:00:00', 3, NULL, NULL),
(4, 9, 1, 4000000.00, 8, 'Mei', NULL, 'paid', NULL, NULL, '2026-05-01', '2026-03-23', '2026-03-24 08:30:00', 3, '2026-03-24 09:30:00', 4),
(5, 5, 0, 1500000.00, 4, 'April', NULL, 'disetujui_ketua', NULL, NULL, '2026-04-15', '2026-03-24', '2026-03-25 09:00:00', 3, '2026-03-26 10:00:00', 4);

INSERT INTO loan_cicilan (loans_id, tanggal_pembayaran, nominal, status_pembayaran, status_updated_at, cicilan, postponement_reason) VALUES
(1, '2026-04-01', 500000.00, 'pending', NULL, 1, NULL),
(1, '2026-05-01', 500000.00, 'pending', NULL, 2, NULL),
(1, '2026-06-01', 500000.00, 'pending', NULL, 3, NULL),
(1, '2026-07-01', 500000.00, 'pending', NULL, 4, NULL),
(1, '2026-08-01', 500000.00, 'pending', NULL, 5, NULL),
(1, '2026-09-01', 500000.00, 'pending', NULL, 6, NULL),
(2, '2026-04-10', 375000.00, 'pending', NULL, 1, NULL),
(2, '2026-05-10', 375000.00, 'pending', NULL, 2, NULL),
(2, '2026-06-10', 375000.00, 'pending', NULL, 3, NULL),
(2, '2026-07-10', 375000.00, 'pending', NULL, 4, NULL),
(2, '2026-08-10', 375000.00, 'pending', NULL, 5, NULL),
(2, '2026-09-10', 375000.00, 'pending', NULL, 6, NULL),
(2, '2026-10-10', 375000.00, 'pending', NULL, 7, NULL),
(2, '2026-11-10', 375000.00, 'pending', NULL, 8, NULL),
(2, '2026-12-10', 375000.00, 'pending', NULL, 9, NULL),
(2, '2027-01-10', 375000.00, 'pending', NULL, 10, NULL),
(2, '2027-02-10', 375000.00, 'pending', NULL, 11, NULL),
(2, '2027-03-10', 375000.00, 'pending', NULL, 12, NULL),
(3, '2026-04-01', 500000.00, 'pending', NULL, 1, NULL),
(3, '2026-05-01', 500000.00, 'postponed', '2026-05-01 10:00:00', 2, 'Masih ada kendala keuangan'),
(3, '2026-06-01', 500000.00, 'pending', NULL, 3, NULL),
(3, '2026-07-01', 500000.00, 'pending', NULL, 4, NULL),
(3, '2026-08-01', 500000.00, 'pending', NULL, 5, NULL),
(4, '2026-05-01', 500000.00, 'paid', '2026-05-01 08:00:00', 1, NULL),
(4, '2026-06-01', 500000.00, 'paid', '2026-06-01 08:00:00', 2, NULL),
(4, '2026-07-01', 500000.00, 'paid', '2026-07-01 08:00:00', 3, NULL),
(4, '2026-08-01', 500000.00, 'paid', '2026-08-01 08:00:00', 4, NULL),
(4, '2026-09-01', 500000.00, 'paid', '2026-09-01 08:00:00', 5, NULL),
(4, '2026-10-01', 500000.00, 'paid', '2026-10-01 08:00:00', 6, NULL),
(4, '2026-11-01', 500000.00, 'paid', '2026-11-01 08:00:00', 7, NULL),
(4, '2026-12-01', 500000.00, 'paid', '2026-12-01 08:00:00', 8, NULL),
(5, '2026-04-15', 375000.00, 'pending', NULL, 1, NULL),
(5, '2026-05-15', 375000.00, 'pending', NULL, 2, NULL),
(5, '2026-06-15', 375000.00, 'pending', NULL, 3, NULL),
(5, '2026-07-15', 375000.00, 'pending', NULL, 4, NULL);

-- 13. ACTIVITY LOGS
INSERT INTO activity_logs (title, message, user_id, icon, status_color, created_at) VALUES
('Stok Masuk', 'Budi PJ Toko menginput stok Indomie sebanyak 40 Dus', 3, 'package', 'success', NOW()),
('Persetujuan Pinjaman', 'Ketua Koperasi menyetujui pinjaman Andi senilai 1.000.000', 4, 'check-circle', 'primary', NOW());

-- 14. AKTIFKAN KEMBALI PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=1;

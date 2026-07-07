-- 1. NONAKTIFKAN PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=0;

-- 2. TRUNCATE TABLES (Sesuai urutan agar bersih)
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE loan_cicilan;
TRUNCATE TABLE loan_approvals;
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

-- 3. RESET AUTO_INCREMENT (Opsional jika TRUNCATE tidak mereset di engine tertentu)
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE unit_conversions AUTO_INCREMENT = 1;

-- 4. MASTER DATA: USERS
INSERT INTO users (id, name, email, username, password, role, created_at, updated_at) VALUES
(1, 'Admin Utama', 'admin@koperasi.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW()),
(2, 'Siti Kasir', 'siti.kasir@koperasi.com', 'siti', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator', NOW(), NOW()),
(3, 'Budi PJ Toko', 'budi.toko@koperasi.com', 'budi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pj_toko', NOW(), NOW()),
(4, 'Agus Ketua Koperasi', 'agus.ketua@koperasi.com', 'agus', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ketua', NOW(), NOW()),
(5, 'Andi Anggota', 'andi.anggota@gmail.com', 'andi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW(), NOW());

-- 5. MASTER DATA: CATEGORIES & UNITS
INSERT INTO categories (id, name, description) VALUES
(1, 'Sembako', 'Kebutuhan pokok pangan'),
(2, 'Alat Tulis', 'Keperluan kantor dan sekolah');

INSERT INTO units (id, name) VALUES
(1, 'PCS'),
(2, 'LUSIN'),
(3, 'DUS'),
(4, 'KODI');

-- 6. UNIT CONVERSIONS (Global)
INSERT INTO unit_conversions (id, name, from_unit_id, to_unit_id, multiplier) VALUES
(1, 'DUS ke PCS', 3, 1, 40),
(2, 'LUSIN ke PCS', 2, 1, 12),
(3, 'KODI ke PCS', 4, 1, 20);

-- 7. PAYMENT METHODS
INSERT INTO payment_methods (id, name, description) VALUES
(1, 'Tunai', 'Pembayaran cash'),
(2, 'QRIS', 'Digital barcode'),
(3, 'Tempo', 'Piutang Anggota');

-- 8. PRODUCTS (Unit_id 1 adalah PCS / Base Unit)
INSERT INTO products (id, category_id, unit_id, barcode, name, current_selling_price, min_stock) VALUES
(1, 1, 1, '8991234567', 'Indomie Goreng', 3500.00, 20),
(2, 2, 2, '8999876543', 'Buku Tulis Sidu', 5000.00, 10);

-- 9. STOCK BATCHES
-- Batch 1: Masuk 1 Dus (40 Pcs)
INSERT INTO stock_batches (product_id, received_unit_id, received_qty_in_unit, multiplier_used, purchase_price, initial_qty, remaining_qty, received_at) VALUES
(1, 3, 1, 40, 2800.00, 40, 40, '2026-03-01 08:00:00');

-- 10. SALES & SALE ITEMS
-- Penjualan 1: User beli 5 PCS secara langsung
INSERT INTO sales (id, invoice_number, user_id, cashier_id, total_bill, total_discount, payment_method_id, payment_status, transaction_date) VALUES
(1, 'INV-20260315-001', 5, 2, 17500.00, 0.00, 1, 'PAID', '2026-03-15 10:30:00'),
(2, 'INV-20260315-002', NULL, 2, 45000.00, 5000.00, 2, 'PAID', '2026-03-15 14:15:22');

INSERT INTO sale_items (
  id, sale_id, product_id, batch_id, qty_input, unit_id, 
  qty_in_base_unit, normal_price, discount_amount, final_price, 
  hpp_at_sale, item_profit
) VALUES
-- BARANG UNTUK NOTA ID 1 (Total Tagihan Induk: 17.500, Diskon: 0)
-- Beli 5 Pcs Indomie @3.500. Modal/HPP per pcs 2.800. Profit per pcs 700. Total Profit = 3.500
(1, 1, 1, 1, 5, 1, 5, 3500.00, 0.00, 17500.00, 2800.00, 3500.00),

-- BARANG UNTUK NOTA ID 2 (Total Tagihan Induk: 45.000, Ada Diskon Global Nota: 5.000)
-- Catatan: Total final_price di keranjang barang harus berjumlah 50.000 (SubTotal sebelum dipotong Diskon Global 5.000 di induk)
-- Item A: Beli 2 Pcs Sabun @15.000 = 30.000. HPP 12.000. Profit = 30.000 - (2 x 12.000) = 6.000
(2, 2, 2, 3, 2, 1, 2, 15000.00, 0.00, 30000.00, 12000.00, 6000.00),

-- Item B: Beli 1 Pcs Minyak @20.000 = 20.000. HPP 16.500. Profit = 20.000 - 16.500 = 3.500
(3, 2, 3, 4, 1, 1, 1, 20000.00, 0.00, 20000.00, 16500.00, 3500.00);

-- 11. SUBMISSIONS & LOANS (Sesuai Skema Loans Baru)
INSERT INTO submissions (id, user_id, type, amount_requested, tenor_months, start_date, reason, pj_status, chairman_status, final_status) VALUES
(1, 5, 'Konsumtif', 1000000.00, 5, '2026-04-01', 'Perbaikan atap', 'APPROVED', 'APPROVED', 'APPROVED');

INSERT INTO loans (id, user_id, jenis_pinjaman, jumlah_pinjaman, lama_pembayaran, tanggal_mulai_cicilan, status_pengajuan) VALUES
(1, 5, 1, 1000000.00, 5, '2026-04-01', 'disetujui_ketua');

-- 12. LOAN CICILAN (Pengganti Recap)
INSERT INTO loan_cicilan (loans_id, cicilan, tanggal_pembayaran, nominal, status_pembayaran) VALUES
(1, 1, '2026-04-01', 200000.00, 'pending'),
(1, 2, '2026-05-01', 200000.00, 'pending');

-- 13. ACTIVITY LOGS
INSERT INTO activity_logs (title, message, user_id, icon, status_color) VALUES
('Stok Masuk', 'Budi PJ Toko menginput stok Indomie sebanyak 1 Dus (40 Pcs)', 3, 'package', 'success'),
('Penjualan', 'Transaksi INV-20260315-001 berhasil simpan', 2, 'shopping-cart', 'primary');

-- 14. PRICE LOGS (Riwayat Perubahan Harga)
INSERT INTO price_logs (id, product_id, user_id, old_price, new_price, change_type, reason, changed_at) VALUES
-- Kasus 1: Budi PJ Toko (User ID 3) menaikkan harga jual Indomie Goreng (Product ID 1) karena kenaikan harga dari distributor.
(1, 1, 3, 3200.00, 3500.00, 'SELLING_PRICE', 'Penyesuaian kenaikan harga distributor pusat', '2026-03-01 09:00:00'),

-- Kasus 2: Budi PJ Toko (User ID 3) mencatat perubahan harga beli (modal) Indomie Goreng (Product ID 1) pada batch stock baru.
(2, 1, 3, 2500.00, 2800.00, 'PURCHASE_PRICE', 'Harga modal naik dari agen grosir', '2026-03-01 08:00:00'),

-- Kasus 3: Admin Utama (User ID 1) mengubah harga jual Buku Tulis Sidu (Product ID 2) untuk program promo menjelang tahun ajaran baru.
(3, 2, 1, 5500.00, 5000.00, 'SELLING_PRICE', 'Diskon khusus menyambut tahun ajaran baru', '2026-03-10 14:00:00');

-- 15. AKTIFKAN KEMBALI PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=1;
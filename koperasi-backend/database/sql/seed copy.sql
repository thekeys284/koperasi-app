-- 1. NONAKTIFKAN PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=0;

-- 2. BERSIHKAN DATA LAMA (TRUNCATE)
-- Urutan ini memastikan tabel-tabel dibersihkan sebelum data baru masuk
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

-- 3. MASTER DATA: USERS
INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'Admin Utama', 'admin@koperasi.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW()),
(2, 'Siti Kasir', 'siti.kasir@koperasi.com', 'siti', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator', NOW()),
(3, 'Budi PJ Toko', 'budi.toko@koperasi.com', 'budi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pj_toko', NOW()),
(4, 'Agus Ketua Koperasi', 'agus.ketua@koperasi.com', 'agus', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ketua', NOW()),
(5, 'Andi Anggota', 'andi.anggota@gmail.com', 'andi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW());

-- 4. MASTER DATA: CATEGORIES & UNITS
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Sembako', 'Kebutuhan pokok pangan'),
(2, 'Alat Tulis', 'Keperluan kantor dan sekolah');

INSERT INTO `units` (`id`, `name`) VALUES
(1, 'PCS'),
(2, 'LUSIN'),
(3, 'DUS');

-- 5. MASTER DATA: PAYMENT METHODS
INSERT INTO `payment_methods` (`id`, `name`, `description`) VALUES
(1, 'Tunai', 'Pembayaran cash di tempat'),
(2, 'QRIS', 'Pembayaran digital barcode'),
(3, 'Tempo', 'Potong gaji bulan depan');

-- 6. PRODUCTS & UNIT CONVERSIONS
INSERT INTO `products` (`id`, `category_id`, `unit_id`, `barcode`, `name`, `detail`, `current_selling_price`, `min_stock`) VALUES
(1, 1, 1, '8991234567', 'Indomie Goreng', 'Indomie rasa original per bungkus', 3500.00, 20),
(2, 2, 1, '8999876543', 'Buku Tulis Sidu', 'Buku tulis isi 38 lembar', 5000.00, 10);

INSERT INTO `unit_conversions` (`product_id`, `from_unit_id`, `to_unit_id`, `multiplier`) VALUES
(1, 3, 1, 40),
(2, 2, 1, 12);

-- 7. STOCK BATCHES & PRICE LOGS
INSERT INTO `stock_batches` (`id`, `product_id`, `purchase_price`, `initial_qty`, `remaining_qty`, `received_at`) VALUES
(1, 1, 2800.00, 40, 10, '2026-03-01 08:00:00'),
(2, 1, 3000.00, 40, 40, '2026-03-10 09:00:00');

INSERT INTO `price_logs` (`product_id`, `user_id`, `old_price`, `new_price`, `change_type`, `reason`) VALUES
(1, 1, 3200.00, 3500.00, 'SELLING_PRICE', 'Kenaikan dari supplier');

-- 8. STOCK ADJUSTMENT
INSERT INTO `stock_adjustments` (`user_id`, `product_id`, `batch_id`, `adjustment_qty`, `type`, `notes`) VALUES
(3, 1, 1, -2, 'DAMAGED', 'Plastik pembungkus robek');

-- 9. SALES TRANSACTION
INSERT INTO `sales` (`id`, `invoice_number`, `user_id`, `cashier_id`, `total_bill`, `payment_method_id`, `payment_status`) VALUES
(1, 'INV-20260315-001', 5, 2, 52500.00, 3, 'UNPAID');

INSERT INTO `sale_items` (`sale_id`, `product_id`, `batch_id`, `qty`, `normal_price`, `final_price`, `hpp_at_sale`, `item_profit`) VALUES
(1, 1, 1, 8, 3500.00, 3500.00, 2800.00, 5600.00),
(1, 1, 2, 7, 3500.00, 3500.00, 3000.00, 3500.00);

-- 10. DEBTS & DEBT PAYMENTS
INSERT INTO `debts` (`id`, `sale_id`, `user_id`, `total_debt`, `remaining_debt`, `due_date`, `status`) VALUES
(1, 1, 5, 52500.00, 52500.00, '2026-03-25', 'UNPAID');

INSERT INTO `debt_payments` (`debt_id`, `user_id`, `amount_paid`, `payment_date`, `payment_status`, `note`) VALUES
(1, 1, 20000.00, '2026-03-20', 'SUCCESS', 'Bayar cash sebagian');

-- 11. SUBMISSIONS, LOANS, & RECAPS
INSERT INTO `submissions` (`id`, `user_id`, `amount_requested`, `tenor_months`, `reason`, `pj_status`, `chairman_status`, `final_status`) VALUES
(1, 5, 1000000.00, 5, 'Biaya perbaikan atap rumah', 'APPROVED', 'APPROVED', 'APPROVED');

INSERT INTO `loans` (`id`, `submission_id`, `user_id`, `total_loan`, `remaining_loan`, `monthly_installment`, `start_date`, `end_date`) VALUES
(1, 1, 5, 1000000.00, 1000000.00, 200000.00, '2026-04-01', '2026-08-01');

INSERT INTO `loan_recap_items` (`loan_id`, `recap_month`, `recap_year`, `amount_to_pay`, `payment_status`) VALUES
(1, 4, 2026, 200000.00, 'PENDING');

-- 12. ACTIVITY LOGS
INSERT INTO `activity_logs` (`title`, `message`, `user_id`, `icon`, `status_color`) VALUES
('Stok Masuk', 'Budi PJ Toko menginput stok Indomie sebanyak 40 Dus', 3, 'package', 'success'),
('Persetujuan Pinjaman', 'Ketua Koperasi menyetujui pinjaman Andi senilai 1.000.000', 4, 'check-circle', 'primary');

-- 13. AKTIFKAN KEMBALI PENGECEKAN FOREIGN KEY
SET FOREIGN_KEY_CHECKS=1;
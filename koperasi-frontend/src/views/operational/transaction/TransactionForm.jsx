import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    Button, TextField, MenuItem, Box, Typography, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Snackbar, Alert, InputAdornment, Grid, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy, IconPlus, IconTrash, IconCheck, IconX, IconPencil, IconPrinter } from '@tabler/icons-react';
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";

const TransactionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const barcodeInputRef = useRef(null);
    
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [members, setMembers] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitConversions, setUnitConversions] = useState([]);
    
    const [inputBarcode, setInputBarcode] = useState('');
    const [inputQty, setInputQty] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [inputDiscountPrice, setInputDiscountPrice] = useState(0);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // --- STATE UNTUK EDIT BARIS KERANJANG ---
    const [editingIndex, setEditingIndex] = useState(null);
    const [editRow, setEditRow] = useState(null);

    // --- STATE UNTUK MODAL INVOICE ---
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null); // snapshot data untuk ditampilkan di invoice

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format tanggal dari 'YYYY-MM-DD' menjadi 'DD/MM/YYYY' untuk tampilan invoice
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const [formData, setFormData] = useState({
        user_id: '',
        payment_method_id: '',
        total_discount: 0,
        amount_paid: 0,
        transaction_date: getTodayDateString(),
    });

    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [resProd, resMem, resPay, resUnit, resUnitConv] = await Promise.all([
                    api.get('/products'),
                    api.get('/members'),
                    api.get('/payment-methods'),
                    api.get('/units'),
                    api.get('/unitconversion')
                ]);

                const mappedProducts = resProd.data.data.map(p => ({
                    ...p,
                    name: p.name ?? p.product_name ?? p.nama_produk ?? '',
                    current_selling_price: parseFloat(
                        p.current_selling_price ?? p.selling_price ?? p.price ?? p.harga_jual ?? 0
                    ) || 0,
                    // Stok nyata (Pcs) hasil rekap batch dari backend, bukan simulasi.
                    stock: Number(p.total_stock) || 0,
                }));

                setProducts(mappedProducts || []);
                setMembers(resMem.data.data || []);
                setPaymentMethods(resPay.data.data || []);
                setUnits(resUnit.data.data || []);
                setUnitConversions(resUnitConv.data.data || []);

                if (isEdit) {
                    loadTransactionDetail();
                }
            } catch (err) {
                console.error("Gagal memuat data master kasir", err);
            }
        };
        fetchMaster();
    }, [id, isEdit]);

    const selectOnFocus = (e) => e.target.select();

    // Autofokus ke kolom scan barcode saat halaman pertama kali dibuka
    useEffect(() => {
        barcodeInputRef.current?.focus();
    }, []);

    const loadTransactionDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/transactions/${id}`);
            const sale = response.data.data;
            setFormData({
                user_id: sale.member?.id || '',
                payment_method_id: sale.payment_method?.id || '',
                total_discount: sale.total_discount || 0,
                amount_paid: sale.amount_paid || 0
            });
            const oldItems = sale.items?.map(item => ({
                product_id: item.product?.id,
                barcode: item.product?.barcode,
                name: item.product?.name,
                qty_input: item.qty_input,
                unit_id: item.unit_id || 1,
                unit_name: item.unit_name || 'Pcs',
                normal_price: parseFloat(item.normal_price) || 0,
                discount_amount: parseFloat(item.discount_amount) || 0,
                final_price: parseFloat(item.final_price) || 0
            })) || [];
            setCart(oldItems);
        } catch (err) {
            setSnackbar({ open: true, message: 'Gagal memuat detail transaksi lama', severity: 'error' });
            console.error("Error loading transaction detail:", err);
        } finally {
            setLoading(false);
        }
    };

    // Ambil faktor konversi dari satuan yang dipilih ke satuan dasar produk (Pcs).
    // Mis. Lusin -> Pcs = 12, Dus -> Pcs = 40, dst. Jika satuan sama, faktornya 1.
    const getMultiplier = (fromUnitId, toUnitId) => {
        if (!fromUnitId || !toUnitId || fromUnitId === toUnitId) return 1;
        const direct = unitConversions.find(c => c.from_unit_id === fromUnitId && c.to_unit_id === toUnitId);
        if (direct) return parseFloat(direct.multiplier) || 1;
        const reverse = unitConversions.find(c => c.from_unit_id === toUnitId && c.to_unit_id === fromUnitId);
        if (reverse && parseFloat(reverse.multiplier) > 0) return 1 / parseFloat(reverse.multiplier);
        return 1;
    };

    // Total qty (dalam satuan dasar/Pcs) suatu produk yang sudah ada di keranjang,
    // dipakai untuk validasi stok lintas baris/satuan yang berbeda.
    const getCartBaseQtyForProduct = (productId, baseUnitId, excludeIndex = -1) => {
        return cart.reduce((sum, item, idx) => {
            if (idx === excludeIndex || item.product_id !== productId) return sum;
            return sum + item.qty_input * getMultiplier(item.unit_id, baseUnitId);
        }, 0);
    };

    const addItemToCart = (productToAdd, quantity, unit, discountPricePerUnit) => {
        if (!productToAdd || quantity <= 0 || !unit) {
            setSnackbar({ open: true, message: 'Pilih produk, satuan, dan masukkan jumlah yang valid.', severity: 'warning' });
            return;
        }

        const currentStock = Number(productToAdd.stock) || 0;
        const baseUnitId = productToAdd.unit_id;
        const multiplier = getMultiplier(unit.id, baseUnitId);
        const qtyInBaseUnit = quantity * multiplier;

        const existingBaseQtyInCart = getCartBaseQtyForProduct(productToAdd.id, baseUnitId);
        const totalRequestedBaseQty = existingBaseQtyInCart + qtyInBaseUnit;

        if (totalRequestedBaseQty > currentStock) {
            const sisaBase = Math.max(0, currentStock - existingBaseQtyInCart);
            const sisaDalamSatuanInput = multiplier > 0 ? Math.floor(sisaBase / multiplier) : 0;
            setSnackbar({
                open: true,
                message: `Stok '${productToAdd.name}' tidak mencukupi. Tersedia: ${currentStock} Pcs (setara ${sisaDalamSatuanInput} ${unit.name}), Diminta: ${qtyInBaseUnit} Pcs.`,
                severity: 'error'
            });
            return;
        }

        const effectivePricePerBaseUnit = Math.max(0, productToAdd.current_selling_price - discountPricePerUnit);
        const itemFinalPrice = effectivePricePerBaseUnit * qtyInBaseUnit;
        const totalDiscountAmount = discountPricePerUnit * qtyInBaseUnit;

        const existingItemIndex = cart.findIndex(item => 
            item.product_id === productToAdd.id && item.unit_id === unit.id
        );

        if (existingItemIndex > -1) {
            const updatedCart = [...cart];
            const existingItem = updatedCart[existingItemIndex];
            updatedCart[existingItemIndex] = {
                ...existingItem,
                qty_input: existingItem.qty_input + quantity,
                final_price: existingItem.final_price + itemFinalPrice,
                discount_amount: existingItem.discount_amount + totalDiscountAmount
            };
            setCart(updatedCart);
        } else {
            setCart([...cart, {
                product_id: productToAdd.id,
                barcode: productToAdd.barcode,
                name: productToAdd.name,
                qty_input: quantity,
                unit_id: unit.id,
                unit_name: unit.name,
                normal_price: productToAdd.current_selling_price,
                discount_amount: totalDiscountAmount,
                final_price: itemFinalPrice
            }]);
        }

        setSelectedProduct(null);
        setInputBarcode('');
        setInputQty(1);
        setSelectedUnit(null); 
        setInputDiscountPrice(0); 
        barcodeInputRef.current?.focus();
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addItemToCart(selectedProduct, inputQty, selectedUnit, inputDiscountPrice);
    };

    const handleBarcodeKeyPress = (e) => {
        if (e.key === 'Enter' && inputBarcode.trim() !== '') {
            e.preventDefault();
            const prod = products.find(p => p.barcode === inputBarcode.trim());
            if (prod) {
                const defaultUnit = units.find(u => u.id === prod.unit_id) || units[0];
                addItemToCart(prod, inputQty > 0 ? inputQty : 1, defaultUnit, inputDiscountPrice);
            } else {
                setSnackbar({ open: true, message: 'Barcode barang tidak ditemukan!', severity: 'warning' });
                setInputBarcode('');
            }
        }
    };

    const handleRemoveItem = (index) => {
        setCart(cart.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditRow(null);
        }
    };

    // ============ FITUR EDIT INLINE BARIS KERANJANG ============

    const handleStartEditRow = (idx) => {
        if (editingIndex === idx) return;
        const item = cart[idx];
        const productRef = products.find(p => p.id === item.product_id);
        const baseUnitId = productRef ? productRef.unit_id : item.unit_id;
        const multiplier = getMultiplier(item.unit_id, baseUnitId);
        const qtyInBaseUnit = item.qty_input * multiplier;
        setEditingIndex(idx);
        setEditRow({
            qty_input: item.qty_input,
            unit_id: item.unit_id,
            unit_name: item.unit_name,
            discount_per_unit: qtyInBaseUnit > 0 ? (item.discount_amount / qtyInBaseUnit) : 0,
        });
    };

    const handleCancelEditRow = () => {
        setEditingIndex(null);
        setEditRow(null);
    };

    const handleSaveEditRow = (idx) => {
        const item = cart[idx];
        const newQty = Math.max(1, parseInt(editRow.qty_input) || 1);
        const newDiscountPerUnit = Math.max(0, parseFloat(editRow.discount_per_unit) || 0);

        const productRef = products.find(p => p.id === item.product_id);
        const baseUnitId = productRef ? productRef.unit_id : item.unit_id;
        const multiplier = getMultiplier(editRow.unit_id, baseUnitId);
        const newQtyInBaseUnit = newQty * multiplier;

        if (productRef) {
            const currentStock = Number(productRef.stock) || 0;
            const otherBaseQtyInCart = getCartBaseQtyForProduct(item.product_id, baseUnitId, idx);
            const totalRequestedBaseQty = otherBaseQtyInCart + newQtyInBaseUnit;
            if (totalRequestedBaseQty > currentStock) {
                setSnackbar({
                    open: true,
                    message: `Stok '${item.name}' tidak mencukupi. Tersedia: ${currentStock} Pcs, Diminta: ${totalRequestedBaseQty} Pcs.`,
                    severity: 'error'
                });
                return;
            }
        }

        const effectivePricePerBaseUnit = Math.max(0, item.normal_price - newDiscountPerUnit);
        const newFinalPrice = effectivePricePerBaseUnit * newQtyInBaseUnit;
        const newTotalDiscount = newDiscountPerUnit * newQtyInBaseUnit;

        const updatedCart = [...cart];
        updatedCart[idx] = {
            ...item,
            qty_input: newQty,
            unit_id: editRow.unit_id,
            unit_name: editRow.unit_name,
            discount_amount: newTotalDiscount,
            final_price: newFinalPrice,
        };
        setCart(updatedCart);
        setEditingIndex(null);
        setEditRow(null);
    };

    const handleEditRowKeyDown = (e, idx) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEditRow(idx);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEditRow();
        }
    };

    // ============================================================

    const currentPricePerUnit = selectedProduct ? selectedProduct.current_selling_price : 0;
    const currentMultiplier = selectedProduct && selectedUnit
        ? getMultiplier(selectedUnit.id, selectedProduct.unit_id)
        : 1;
    const currentEffectivePricePerUnit = Math.max(0, currentPricePerUnit - inputDiscountPrice);
    // Subtotal mengikuti satuan yang dipilih: qty * multiplier * (harga satuan - diskon per satuan)
    const currentSubtotalInput = currentEffectivePricePerUnit * currentMultiplier * inputQty;

    const subTotal = cart.reduce((sum, item) => sum + item.final_price, 0);
    const grandTotal = Math.max(0, subTotal - formData.total_discount);
    const changeAmount = Math.max(0, formData.amount_paid - grandTotal);

    const handleSubmitTransaction = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            return setSnackbar({ open: true, message: 'Keranjang belanja kosong!', severity: 'error' });
        }
        if (!formData.payment_method_id) {
            return setSnackbar({ open: true, message: 'Pilih Metode Pembayaran terlebih dahulu!', severity: 'warning' });
        }

        const payload = {
            user_id: formData.user_id || null,
            payment_method_id: formData.payment_method_id,
            total_discount: parseFloat(formData.total_discount),
            transaction_date: formData.transaction_date,
            items: cart.map(item => ({
                product_id: item.product_id,
                qty_input: item.qty_input,
                selling_price: item.normal_price,
                unit_id: item.unit_id,
                discount_amount: item.discount_amount
            }))
        };

        // --- Siapkan snapshot data invoice SEBELUM cart/formData direset ---
        const memberName = members.find(m => m.id === formData.user_id)?.name || 'Umum / Tanpa Member';
        const paymentMethodName = paymentMethods.find(p => p.id === formData.payment_method_id)?.name || '-';

        const invoiceSnapshot = {
            customerName: memberName,
            transactionDate: formData.transaction_date,
            paymentMethodName,
            items: cart.map(item => ({ ...item })), // salin array supaya tidak ke-mutasi
            totalDiscount: formData.total_discount,
            subTotal,
            grandTotal,
            amountPaid: formData.amount_paid,
            changeAmount,
        };

        try {
            setLoading(true);
            if (isEdit) {
                await api.put(`/transactions/${id}`, payload);
            } else {
                await api.post('/transactions', payload);
            }

            setSnackbar({ open: true, message: 'Transaksi Kasir Berhasil Disimpan!', severity: 'success' });

            // Tampilkan modal invoice, TIDAK navigate ke halaman daftar transaksi
            setInvoiceData(invoiceSnapshot);
            setInvoiceOpen(true);

        } catch (err) {
            console.error("Error saving transaction:", err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Gagal menyimpan transaksi', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Dipanggil saat modal invoice ditutup / user siap melayani transaksi baru
    const handleCloseInvoiceAndReset = () => {
        setInvoiceOpen(false);
        setInvoiceData(null);

        // Reset form & keranjang untuk transaksi berikutnya
        setCart([]);
        setFormData({
            user_id: '',
            payment_method_id: '',
            total_discount: 0,
            amount_paid: 0,
            transaction_date: getTodayDateString(),
        });
        setSelectedProduct(null);
        setSelectedUnit(null);
        setInputQty(1);
        setInputDiscountPrice(0);
        setInputBarcode('');

        // Kalau sebelumnya mode edit transaksi lama, arahkan balik ke daftar transaksi
        if (isEdit) {
            navigate('/operational/transactions');
        } else {
            barcodeInputRef.current?.focus();
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    return (
        <MainCard title={isEdit ? "Koreksi Transaksi Penjualan" : "Transaksi Penjualan Baru (POS)"}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/operational/transactions')}>
                    Kembali
                </Button>
                <Button variant="contained" color="primary" startIcon={<IconDeviceFloppy />} onClick={handleSubmitTransaction} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                </Button>
            </Box>

            <Grid container spacing={3} alignItems="stretch">

                {/* Informasi Pelanggan */}
                <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Paper variant="outlined" sx={{ p: 2, overflow: 'hidden', borderRadius: '8px', width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <Typography variant="subtitle2" sx={{ color: 'teal.main', mb: 2, fontWeight: 600 }}>
                            Data Informasi Pelanggan
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 12 }}>
                                <Autocomplete
                                    options={members}
                                    getOptionLabel={(option) => option.name || ''}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={members.find(m => m.id === formData.user_id) || null}
                                    onChange={(_, newValue) => setFormData({ ...formData, user_id: newValue?.id || '' })}
                                    renderInput={(params) => <TextField {...params} label="Pelanggan / Member Koperasi" size="small" placeholder="Pilih Anggota Koperasi..." />}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Tanggal & Cara Pembayaran */}
                <Grid size={{ xs: 12, sm: 5 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Paper variant="outlined" sx={{ p: 2, overflow: 'hidden', borderRadius: '8px', width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="subtitle2" sx={{ color: 'teal.main', mb: 2, fontWeight: 600 }}>
                                    Tanggal Transaksi
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    size="small"
                                    value={formData.transaction_date}
                                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <Typography variant="subtitle2" sx={{ color: 'teal.main', mb: 2, fontWeight: 600 }}>
                                    Cara Pembayaran
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {paymentMethods.map((method) => {
                                        const isSelected = formData.payment_method_id === method.id;
                                        return (
                                            <Button
                                                key={method.id}
                                                variant={isSelected ? "contained" : "outlined"}
                                                color="teal"
                                                size="small"
                                                onClick={() => setFormData({ ...formData, payment_method_id: method.id })}
                                                sx={{
                                                    borderRadius: '20px',
                                                    px: 3,
                                                    py: 0.8,
                                                    fontWeight: isSelected ? 'bold' : 'normal',
                                                    textTransform: 'none',
                                                    bgcolor: isSelected ? '#d2ffd2' : 'transparent',
                                                    color: isSelected ? '#000000' : 'teal.main',
                                                    borderColor: isSelected ? '#4caf50' : 'teal.main',
                                                    '&:hover': {
                                                        bgcolor: isSelected ? 'teal.dark' : 'rgba(0, 128, 128, 0.08)',
                                                        borderColor: isSelected ? '#388e3c' : 'teal.main',
                                                    }
                                                }}
                                            >
                                                {method.name}
                                            </Button>
                                        );
                                    })}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Informasi Pembayaran */}
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{
                        width: '100%',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0px 1px 3px rgba(0,0,0,0.05)'
                    }}>

                        {/* BARIS 1: TOTAL */}
                        <Box sx={{ bgcolor: '#ffebd4', px: 2.5, py: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: '#a01a00', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                TOTAL
                            </Typography>
                            <Typography sx={{ color: '#540d00', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'sans-serif' }}>
                                {new Intl.NumberFormat('id-ID').format(grandTotal)}
                            </Typography>
                        </Box>

                        {/* BARIS 2: BAYAR */}
                        <Box sx={{
                            bgcolor: '#fffee0',
                            px: 2.5, py: 0.8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <Typography sx={{ color: '#0000d1', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                BAYAR
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                size="small"
                                value={formData.amount_paid}
                                onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '35px',
                                        fontSize: '1.4rem',
                                        fontWeight: 800,
                                        fontFamily: 'sans-serif',
                                        color: '#000080',
                                        '& fieldset': { border: 'none' },
                                        '&:hover fieldset': { border: 'none' },
                                        '&.Mui-focused fieldset': { border: 'none' },
                                    },
                                    '& .MuiInputBase-input': {
                                        textAlign: 'right',
                                        padding: '0 8px',
                                    },
                                }}
                                inputProps={{ min: 0 }}
                                onFocus={selectOnFocus}
                            />
                        </Box>

                        {/* BARIS 3: KEMBALI */}
                        <Box sx={{ bgcolor: '#d2ffd2', px: 2.5, py: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                KEMBALI
                            </Typography>
                            <Typography sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'sans-serif' }}>
                                {new Intl.NumberFormat('id-ID').format(changeAmount)}
                            </Typography>
                        </Box>

                    </Box>
                </Grid>

            </Grid>

            {/* Scan Barcode */}
            <Box sx={{ mt: 3, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Scan Barcode"
                    size="medium"
                    value={inputBarcode}
                    onChange={(e) => setInputBarcode(e.target.value)}
                    onKeyDown={handleBarcodeKeyPress}
                    inputRef={barcodeInputRef}
                    placeholder="Arahkan scanner ke sini lalu scan, atau ketik manual + Enter"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconBarcode size="20" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
            </Box>

            {/* Product Input Row */}
            <Grid container spacing={3} alignItems="stretch" sx={{ pt: 1 }}>
                <Paper 
                    component="form"
                    onSubmit={handleAddSubmit}
                    variant="outlined" 
                    sx={{ p: 2, overflow: 'hidden', borderRadius: '8px', width: '100%', height: '100%', boxSizing: 'border-box' }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Autocomplete
                                options={products}
                                getOptionLabel={(option) => option.name || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={selectedProduct}
                                onChange={(_, newValue) => {
                                    setSelectedProduct(newValue);
                                    if (newValue) {
                                        const defaultUnit = units.find(u => u.id === newValue.unit_id) || units[0];
                                        setSelectedUnit(defaultUnit);
                                    } else {
                                        setSelectedUnit(null);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Cari Produk" 
                                        size="small" 
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value !== '') {
                                                e.stopPropagation();
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                            <TextField
                                fullWidth
                                label="Qty"
                                type="number"
                                size="small"
                                value={inputQty}
                                onChange={(e) => setInputQty(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1 }}
                                onFocus={selectOnFocus}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                            <Autocomplete
                                options={units}
                                getOptionLabel={(option) => option.name || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={selectedUnit}
                                onChange={(_, newValue) => setSelectedUnit(newValue)}
                                renderInput={(params) => <TextField {...params} label="Satuan" size="small" />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <TextField
                                fullWidth
                                label="Harga Satuan Rp"
                                type="text"
                                size="small"
                                value={new Intl.NumberFormat('id-ID').format(currentPricePerUnit)}
                                slotProps={{
                                    input: { readOnly: true }
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f5f5f5' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <TextField
                                fullWidth
                                label="Diskon per Satuan Rp"
                                type="number"
                                size="small"
                                value={inputDiscountPrice}
                                onChange={(e) => setInputDiscountPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                inputProps={{ min: 0 }}
                                onFocus={selectOnFocus}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                            <TextField
                                fullWidth
                                label="Subtotal Harga Rp"
                                type="text"
                                size="small"
                                value={new Intl.NumberFormat('id-ID').format(currentSubtotalInput)}
                                slotProps={{
                                    input: { readOnly: true }
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f5f5f5' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!selectedProduct || !selectedUnit || inputQty <= 0}
                                sx={{
                                    borderRadius: '20px',
                                    px: 2,
                                    py: 0.8,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    bgcolor: '#25c08c',
                                    color: '#ffffff',
                                    '&:hover': { bgcolor: '#1ea378' }
                                }}
                            >
                                Tambah
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Cart Table — Editable per baris */}
            <Grid container spacing={3} alignItems="stretch" sx={{ pt: 2 }}>
                <Grid size={{ xs: 12, sm: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', maxHeight: 350 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell align="center" width="60">No.</TableCell>
                                    <TableCell>Kode</TableCell>
                                    <TableCell>Nama Barang</TableCell>
                                    <TableCell align="center" width="100">Jumlah</TableCell>
                                    <TableCell width="120">Satuan</TableCell>
                                    <TableCell align="right">Harga Jual</TableCell>
                                    <TableCell align="right" width="140">Diskon</TableCell>
                                    <TableCell align="right">Total Harga</TableCell>
                                    <TableCell align="center" width="90">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cart.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                                            Keranjang kasir kosong. Silakan scan barcode atau masukkan barang di atas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cart.map((item, idx) => {
                                        const isEditingRow = editingIndex === idx;

                                        return (
                                            <TableRow
                                                key={idx}
                                                hover
                                                onClick={() => handleStartEditRow(idx)}
                                                sx={{
                                                    cursor: isEditingRow ? 'default' : 'pointer',
                                                    bgcolor: isEditingRow ? 'rgba(0, 128, 128, 0.06)' : 'inherit',
                                                }}
                                            >
                                                <TableCell align="center">{idx + 1}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{item.barcode}</TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>

                                                {/* JUMLAH — editable */}
                                                <TableCell align="center" onClick={(e) => isEditingRow && e.stopPropagation()}>
                                                    {isEditingRow ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            autoFocus
                                                            value={editRow.qty_input}
                                                            onChange={(e) => setEditRow({ ...editRow, qty_input: e.target.value })}
                                                            onKeyDown={(e) => handleEditRowKeyDown(e, idx)}
                                                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                            sx={{ width: 70 }}
                                                        />
                                                    ) : (
                                                        item.qty_input
                                                    )}
                                                </TableCell>

                                                {/* SATUAN — editable */}
                                                <TableCell onClick={(e) => isEditingRow && e.stopPropagation()}>
                                                    {isEditingRow ? (
                                                        <Autocomplete
                                                            options={units}
                                                            getOptionLabel={(option) => option.name || ''}
                                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                                            value={units.find(u => u.id === editRow.unit_id) || null}
                                                            onChange={(_, newValue) => setEditRow({
                                                                ...editRow,
                                                                unit_id: newValue?.id || editRow.unit_id,
                                                                unit_name: newValue?.name || editRow.unit_name,
                                                            })}
                                                            renderInput={(params) => (
                                                                <TextField {...params} size="small" onKeyDown={(e) => handleEditRowKeyDown(e, idx)} />
                                                            )}
                                                            sx={{ minWidth: 110 }}
                                                        />
                                                    ) : (
                                                        item.unit_name
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">Rp {new Intl.NumberFormat('id-ID').format(item.normal_price)}</TableCell>

                                                {/* DISKON per satuan — editable */}
                                                <TableCell align="right" onClick={(e) => isEditingRow && e.stopPropagation()}>
                                                    {isEditingRow ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={editRow.discount_per_unit}
                                                            onChange={(e) => setEditRow({ ...editRow, discount_per_unit: e.target.value })}
                                                            onKeyDown={(e) => handleEditRowKeyDown(e, idx)}
                                                            inputProps={{ min: 0, style: { textAlign: 'right' } }}
                                                            sx={{ width: 110 }}
                                                            helperText="per satuan"
                                                            onFocus={selectOnFocus}
                                                        />
                                                    ) : (
                                                        `Rp ${new Intl.NumberFormat('id-ID').format(item.discount_amount)}`
                                                    )}
                                                </TableCell>

                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'teal.main' }}>
                                                    Rp {new Intl.NumberFormat('id-ID').format(item.final_price)}
                                                </TableCell>

                                                {/* AKSI */}
                                                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                                    {isEditingRow ? (
                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                            <Tooltip title="Simpan">
                                                                <IconButton color="success" size="small" onClick={() => handleSaveEditRow(idx)}>
                                                                    <IconCheck size={16} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Batal">
                                                                <IconButton color="default" size="small" onClick={handleCancelEditRow}>
                                                                    <IconX size={16} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                            <Tooltip title="Edit baris">
                                                                <IconButton color="primary" size="small" onClick={() => handleStartEditRow(idx)}>
                                                                    <IconPencil size={16} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Hapus">
                                                                <IconButton color="error" size="small" onClick={() => handleRemoveItem(idx)}>
                                                                    <IconTrash size={16} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Discount Transaksi */}
            <Grid container spacing={3} sx={{ pt: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        label="Diskon Transaksi (Rp)"
                        type="number"
                        size="small"
                        value={formData.total_discount}
                        onChange={(e) => setFormData({ ...formData, total_discount: parseFloat(e.target.value) || 0 })}
                        inputProps={{ min: 0 }}
                        onFocus={selectOnFocus}
                    />
                </Grid>
            </Grid>

            {/* ============ MODAL INVOICE ============ */}
            <Dialog 
                open={invoiceOpen} 
                onClose={(event, reason) => {
                    // Cegah tertutup tidak sengaja via klik luar / Escape,
                    // supaya kasir sadar untuk klik tombol "Transaksi Baru".
                    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
                }}
                maxWidth="xs" 
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, pb: 0.5 }}>
                    Koperasi StatMart
                </DialogTitle>
                <DialogContent dividers>
                    {invoiceData && (
                        <Box>
                            {/* Info Pelanggan & Tanggal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2">
                                    <b>Pelanggan:</b> {invoiceData.customerName}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Tanggal:</b> {formatDateDisplay(invoiceData.transactionDate)}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />

                            {/* Tabel Item Belanja */}
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, px: 0.5 }}>Nama Barang</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, px: 0.5 }}>Jml</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, px: 0.5 }}>Harga</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, px: 0.5 }}>Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {invoiceData.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell sx={{ px: 0.5 }}>{item.name}</TableCell>
                                                <TableCell align="center" sx={{ px: 0.5 }}>
                                                    {item.qty_input} {item.unit_name}
                                                </TableCell>
                                                <TableCell align="right" sx={{ px: 0.5 }}>
                                                    {new Intl.NumberFormat('id-ID').format(item.normal_price)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ px: 0.5 }}>
                                                    {new Intl.NumberFormat('id-ID').format(item.final_price)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Ringkasan Total */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Subtotal</Typography>
                                    <Typography variant="body2">Rp {new Intl.NumberFormat('id-ID').format(invoiceData.subTotal)}</Typography>
                                </Box>
                                {invoiceData.totalDiscount > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Diskon Transaksi</Typography>
                                        <Typography variant="body2">- Rp {new Intl.NumberFormat('id-ID').format(invoiceData.totalDiscount)}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>TOTAL</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                        Rp {new Intl.NumberFormat('id-ID').format(invoiceData.grandTotal)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Bayar</Typography>
                                    <Typography variant="body2">Rp {new Intl.NumberFormat('id-ID').format(invoiceData.amountPaid)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Kembali</Typography>
                                    <Typography variant="body2">Rp {new Intl.NumberFormat('id-ID').format(invoiceData.changeAmount)}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Metode Pembayaran */}
                            <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                                Metode Pembayaran: {invoiceData.paymentMethodName}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<IconPrinter size={18} />}
                        onClick={handlePrintInvoice}
                    >
                        Cetak
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCloseInvoiceAndReset}
                    >
                        {isEdit ? 'Selesai' : 'Transaksi Baru'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '8px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </MainCard>
    ); 
};

export default TransactionForm;

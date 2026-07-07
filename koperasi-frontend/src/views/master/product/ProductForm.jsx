import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch,
     Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';

const ProductForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [categories, setCategories]=useState([]);
    const [units, setUnits] = useState([]);
    const [fetching, setFetching] = useState(false);
    const [checkingBarcode, setCheckingBarcode] = useState(false);

    // Ref untuk kontrol fokus antar-field saat entri cepat via scan
    const barcodeInputRef = useRef(null);
    const nameInputRef = useRef(null);

    const [formData, setFormData] = useState({
        category_id:'',
        unit_id: '',
        barcode:'',
        name:'',
        detail:'',
        price:'',
        min_stock:'',
        is_active:true
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // bisa 'success', 'error', 'info', atau 'warning'
    });
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(()=>{
        api.get('/categories').then(res => setCategories(res.data.data || []));
        api.get('/units').then(res => setUnits(res.data.data || []));
        if (isEdit) { 
            setFetching(true);
            api.get(`/products/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const product = res.data.data;
                        setFormData({
                            category_id: product.category_id || '',
                            unit_id: product.unit_id || '',
                            barcode : product.barcode || '',
                            name : product.name || '',
                            detail : product.detail || '',
                            price : product.price || '',
                            min_stock : product.min_stock || '5',
                            is_active : product.is_active === 1 || product.is_active === true
                        });
                    }
                })
                .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    // Autofokus ke kolom Barcode saat halaman tambah produk pertama kali dibuka
    useEffect(() => {
        if (!isEdit) {
            barcodeInputRef.current?.focus();
        }
    }, [isEdit]);

    /**
     * Dipanggil saat barcode di-scan (ditandai dengan tombol Enter dari scanner)
     * atau saat user menekan Enter setelah mengetik manual.
     * 
     * Alurnya:
     * 1. Cek apakah barcode sudah terdaftar di database via API.
     * 2. Jika SUDAH ada -> beri peringatan duplikat, bersihkan input, fokus kembali ke barcode.
     * 3. Jika BELUM ada -> lanjutkan entri, pindahkan fokus ke field "Nama Produk".
     */
    const handleBarcodeScan = async (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const code = formData.barcode.trim();
        if (code === '') return;

        // Saat mode edit, tidak perlu validasi duplikat (barcode sudah milik produk ini)
        if (isEdit) {
            nameInputRef.current?.focus();
            return;
        }

        try {
            setCheckingBarcode(true);
            // Sesuaikan endpoint ini dengan API backend kamu untuk cek barcode.
            // Contoh umum: GET /products?barcode=xxxx atau endpoint khusus /products/check-barcode/xxxx
            const res = await api.get('/products', { params: { barcode: code } });
            const found = res.data?.data?.find(p => p.barcode === code);

            if (found) {
                setSnackbar({
                    open: true,
                    message: `Barcode "${code}" sudah terdaftar untuk produk "${found.name}". Silakan edit produk tersebut jika ingin mengubah data.`,
                    severity: 'warning'
                });
                setFormData(prev => ({ ...prev, barcode: '' }));
                barcodeInputRef.current?.focus();
            } else {
                // Barcode baru, lanjut entri -> pindah fokus ke Nama Produk
                nameInputRef.current?.focus();
            }
        } catch (err) {
            console.error('Gagal memeriksa barcode:', err);
            // Kalau API cek gagal (misal endpoint belum ada), tetap lanjutkan alur entri
            nameInputRef.current?.focus();
        } finally {
            setCheckingBarcode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            if (isEdit){
                await api.put(`/products/${id}`, formData);
            } else {
                await api.post('/products', formData);
            } 
            setSnackbar({
                open: true,
                message: isEdit ? 'Data produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!',
                severity: 'success'
            });
            setTimeout(() => {
                navigate('/master/products');
            }, 1500);
        } catch(error){
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset form + fokus balik ke barcode, untuk entri barang berikutnya secara berurutan
    const handleResetForNextEntry = () => {
        setFormData({
            category_id: formData.category_id, // kategori & unit sering sama untuk barang sejenis, jadi dipertahankan
            unit_id: formData.unit_id,
            barcode: '',
            name: '',
            detail: '',
            price: '',
            min_stock: formData.min_stock,
            is_active: true
        });
        barcodeInputRef.current?.focus();
    };
    
    if (fetching) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <MainCard title={isEdit ? "Edit Product" : "Tambah Product Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid  container spacing={3}>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Barcode</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField
                            fullWidth
                            label="Barcode/Kode Barang"
                            required
                            placeholder="Scan barcode di sini, atau ketik manual lalu Enter..."
                            value={formData.barcode}
                            onChange={(e)=> setFormData({...formData, barcode:e.target.value})}
                            onKeyDown={handleBarcodeScan}
                            inputRef={barcodeInputRef}
                            InputProps={{
                                startAdornment:(
                                    <InputAdornment position="start">
                                        <IconBarcode size="20"/>
                                    </InputAdornment>
                                ),
                                endAdornment: checkingBarcode && (
                                    <InputAdornment position="end">
                                        <CircularProgress size={18} />
                                    </InputAdornment>
                                )
                            }}/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Kategori Barang</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={categories.find((c)=> c.id === formData.category_id) || null}
                            onChange={(event, newValue)=>{
                                setFormData({...formData, category_id:newValue?.id || ''});
                            }}
                            renderInput={(params)=><TextField {...params} label="Kategori Barang" required />}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Nama Produk</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:10}}>
                        <TextField
                            fullWidth
                            label="Nama Produk"
                            required
                            value={formData.name}
                            onChange={(e)=> setFormData({...formData, name:e.target.value})}
                            inputRef={nameInputRef}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Deskripsi Produk</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:10}}>
                        <TextField
                            fullWidth
                            label="Detail Produk (Optional)"
                            multiline
                            rows={2}
                            placeholder="Contoh: Ukuran 500ml, Rasa Cokelat, dsb."
                            value={formData.detail}
                            onChange={(e)=>setFormData({...formData, detail:e.target.value})}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Harga Jual Saat Ini</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField
                            fullWidth
                            label="Harga Jual Saat Ini"
                            type="number"
                            required
                            InputProps={{
                                startAdornment:<InputAdornment position="start">Rp</InputAdornment>,
                            }}
                            value={formData.price}
                            onChange={(e)=>setFormData({...formData, price:e.target.value})}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Minimal Stock</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField 
                            fullWidth
                            label="Minimal Stok"
                            type="number"
                            value={formData.min_stock}
                            onChange={(e)=>setFormData({...formData, min_stock:e.target.value})}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Satuan unit yang digunakan</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <Autocomplete
                            options={units}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={units.find((c)=> c.id === formData.unit_id) || null}
                            onChange={(event, newValue)=>{
                                setFormData({...formData, unit_id:newValue?.id || ''});
                            }}
                            renderInput={(params)=><TextField {...params} label="Unit" required />}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControlLabel
                        control={
                            <Switch
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            color="primary"
                            />
                        }
                        label="Tampilkan produk ini di kasir (aktif)"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/master/products')}
                        >
                            Batal
                        </Button>
                        {!isEdit && (
                            <Button
                                variant="outlined"
                                color="primary"
                                type="submit"
                                disabled={loading}
                                onClick={() => { /* handleSubmit tetap jalan via form onSubmit */ }}
                            >
                                Simpan & Entri Barang Lagi
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                            startIcon={<IconDeviceFloppy />}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Barang'}
                        </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainCard>

    );
};

    
export default ProductForm;
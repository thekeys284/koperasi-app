import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch,
     Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';

const StockBatchForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [products, setProducts]=useState([]);
    const [units, setUnits] = useState([]);
    const [unitConversions, setUnitConversions] = useState([]);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        product_id: '',
        received_unit_id: '',
        received_qty_in_unit : '',
        multiplier_used : '1',
        purchase_price : '',
        initial_qty : '',
        remaining_qty : '',
        expiry_date : '',
        received_at : '',
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
        api.get('/units').then(res => setUnits(res.data.data || []));
        api.get('/products').then(res => setProducts(res.data.data || []));
        api.get('/unitconversion').then(res => setUnitConversions(res.data.data || []));
        if (isEdit) { 
            setFetching(true);
            api.get(`/stockbatch/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const stock = res.data.data;
                        setFormData({
                            product_id: stock.product_id || '',
                            received_unit_id: stock.received_unit_id || '',
                            received_qty_in_unit : stock.received_qty_in_unit || '',
                            multiplier_used : stock.multiplier_used || '',
                            purchase_price : stock.purchase_price || '',
                            initial_qty : stock.initial_qty || '',
                            remaining_qty : stock.remaining_qty || '',
                            expiry_date : stock.expiry_date ? stock.expiry_date.split('T')[0] : '',
                            received_at : stock.received_at ? stock.received_at.substring(0, 16) : '',
                        });
                    }
                })
                .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Format received_at dari "YYYY-MM-DDTHH:mm" menjadi "YYYY-MM-DD HH:mm:ss"
        const payload = { ...formData };
        if (payload.received_at && payload.received_at.includes('T')) {
            payload.received_at = payload.received_at.replace('T', ' ') + ':00';
        }

        try{
            if (isEdit){
                await api.put(`/stockbatch/${id}`, payload);
            } else {
                await api.post('/stockbatch', payload);
            } 
            setSnackbar({
                open: true,
                message: isEdit ? 'Data stock produk berhasil diperbarui!' : 'Stock Produk baru berhasil ditambahkan!',
                severity: 'success'
            });
            setTimeout(() => {
                navigate('/master/stocks');
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
    
    if (fetching) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <MainCard title={isEdit ? "Edit Stock Product" : "Tambah Stock Product"}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Pilih Produk</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 10 }}>
                        <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name || ''}
                            value={products.find((c) => c.id == formData.product_id) || null}
                            onChange={(event, newValue) => {
                                const selectedProductId = newValue?.id || '';
                                let multiplier = formData.multiplier_used;
                                let newReceivedUnitId = formData.received_unit_id;
                                const targetUnitId = newValue?.unit_id || newValue?.unit?.id;
                                
                                let conversion = null;
                                
                                if (newValue?.unit_conversion_id) {
                                    conversion = unitConversions.find(uc => uc.id == newValue.unit_conversion_id);
                                }
                                
                                // 2. Jika tidak ada relasi langsung, cari konversi manapun yang "unit tujuan"-nya = unit dasar produk
                                if (!conversion && targetUnitId) {
                                    if (newReceivedUnitId) {
                                        conversion = unitConversions.find(
                                            (uc) => (uc.from_unit_id == newReceivedUnitId || uc.fromUnit?.id == newReceivedUnitId || uc.from_unit?.id == newReceivedUnitId) && 
                                                    (uc.to_unit_id == targetUnitId || uc.toUnit?.id == targetUnitId || uc.to_unit?.id == targetUnitId)
                                        );
                                    }
                                    if (!conversion) {
                                        // Ambil master konversi pertama yang terhubung ke unit dasar produk ini (Otomatis)
                                        conversion = unitConversions.find(
                                            (uc) => uc.to_unit_id == targetUnitId || uc.toUnit?.id == targetUnitId || uc.to_unit?.id == targetUnitId
                                        );
                                    }
                                }

                                if (conversion) {
                                    multiplier = conversion.multiplier;
                                    newReceivedUnitId = conversion.from_unit_id || conversion.fromUnit?.id || conversion.from_unit?.id || newReceivedUnitId;
                                } else if (newReceivedUnitId == targetUnitId) {
                                    multiplier = 1;
                                }
                                
                                const qty = parseFloat(formData.received_qty_in_unit) || 0;
                                const mult = parseFloat(multiplier) || 1;
                                setFormData({ 
                                    ...formData, 
                                    product_id: selectedProductId, 
                                    received_unit_id: newReceivedUnitId, // Update Satuan Beli otomatis
                                    multiplier_used: multiplier, 
                                    initial_qty: qty * mult, 
                                    remaining_qty: qty * mult 
                                });
                            }}
                            renderInput={(params) => <TextField {...params} label="Cari Produk" required />}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Satuan Pembelian</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Autocomplete
                            options={units}
                            getOptionLabel={(option) => option.name || ''}
                            value={units.find((c) => c.id == formData.received_unit_id) || null}
                            onChange={(event, newValue) => {
                                const selectedUnitId = newValue?.id || '';
                                let multiplier = 1;
                                const selectedProduct = products.find((p) => p.id == formData.product_id);
                                let targetUnitId = selectedProduct?.unit_id || selectedProduct?.unit?.id;
                                
                                // Ambil fallback unit target dari relasi konversi produk jika unit_id dasar tidak terbaca
                                if (!targetUnitId && selectedProduct?.unit_conversion_id) {
                                    const prodConv = unitConversions.find(uc => uc.id == selectedProduct.unit_conversion_id);
                                    if (prodConv) targetUnitId = prodConv.to_unit_id || prodConv.toUnit?.id || prodConv.to_unit?.id;
                                }
                                
                                if (selectedUnitId) {
                                    let conversion = null;
                                    if (targetUnitId) {
                                        conversion = unitConversions.find(
                                            (uc) => (uc.from_unit_id == selectedUnitId || uc.fromUnit?.id == selectedUnitId || uc.from_unit?.id == selectedUnitId) && 
                                                    (uc.to_unit_id == targetUnitId || uc.toUnit?.id == targetUnitId || uc.to_unit?.id == targetUnitId)
                                        );
                                    }
                                    // Fallback: Jika tidak ketemu, tarik konversi manapun yang asal satuannya sama (contoh Dus -> ...)
                                    if (!conversion) {
                                        conversion = unitConversions.find(
                                            (uc) => (uc.from_unit_id == selectedUnitId || uc.fromUnit?.id == selectedUnitId || uc.from_unit?.id == selectedUnitId)
                                        );
                                    }
                                    if (conversion) {
                                        multiplier = conversion.multiplier;
                                    }
                                }
                                
                                const qty = parseFloat(formData.received_qty_in_unit) || 0;
                                const mult = parseFloat(multiplier) || 1;
                                setFormData({ ...formData, received_unit_id: selectedUnitId, multiplier_used: multiplier, initial_qty: qty * mult, remaining_qty: qty * mult });
                            }}
                            renderInput={(params) => <TextField {...params} label="Satuan (cth: Dus, Pack)" required />}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Qty Pembelian</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Jumlah (dalam Satuan)"
                            type="number"
                            required
                            value={formData.received_qty_in_unit}
                            onChange={(e) => {
                                const qty = parseFloat(e.target.value) || 0;
                                const mult = parseFloat(formData.multiplier_used) || 1;
                                setFormData({ ...formData, received_qty_in_unit: e.target.value, initial_qty: qty * mult, remaining_qty: qty * mult });
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Harga Beli</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Harga Beli / Kulakan satuan"
                            type="number"
                            required
                            InputProps={{
                                startAdornment:<InputAdornment position="start">Rp</InputAdornment>,
                            }}
                            value={formData.purchase_price}
                            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Multiplier Unit</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Konversi ke Satuan Terkecil"
                            type="number"
                            required
                            value={formData.multiplier_used}
                            onChange={(e) => {
                                const mult = parseFloat(e.target.value) || 1;
                                const qty = parseFloat(formData.received_qty_in_unit) || 0;
                                setFormData({ ...formData, multiplier_used: e.target.value, initial_qty: qty * mult, remaining_qty: qty * mult });
                            }}
                            helperText="Misal: 1 Dus isi 24 pcs -> isi 24"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Total Qty Awal</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField 
                            fullWidth
                            label="Initial Qty"
                            type="number"
                            required
                            value={formData.initial_qty}
                            onChange={(e) => setFormData({ ...formData, initial_qty: e.target.value })}
                            helperText="Terhitung otomatis (Qty x Multiplier)"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Sisa Stock Qty</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Remaining Qty"
                            type="number"
                            required
                            value={formData.remaining_qty}
                            onChange={(e) => setFormData({ ...formData, remaining_qty: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Expiry Date</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Tanggal Input</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={formData.received_at}
                            onChange={(e) => setFormData({ ...formData, received_at: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/master/stocks')}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                            startIcon={<IconDeviceFloppy />}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Stock'}
                        </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Muncul di pojok kanan bawah
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled" // Agar warnanya solid khas Material UI modern
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainCard>

    );
};

    
export default StockBatchForm;
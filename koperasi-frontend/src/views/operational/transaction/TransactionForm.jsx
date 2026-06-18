import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch,
     Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';
import { batch } from "react-redux";

const TransactionForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [categories, setCategories]=useState([]);
    const [units, setUnits] = useState([]);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        member_id:'',
        cashier_id:'',
        total_discount:'',
    });

    const [formCart, setCart] = ([])
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
        api.get('/products').then(res => setProducts(res.data.data || []));
        api.get('/units').then(res => setUnits(res.data.data || []));
        api.get('/unitconversion').then(res => setUnitConversion(res.data.data || []));
        api.get('/members').then(res => setMembers(res.data.data || []));
        api.get('/users').then(res => setUsers(res.data.data || []));
        if (isEdit) { 
            setFetching(true);
            api.get(`/transactions/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const transaction = res.data.data;
                        setFormData({
                            cashier_id: transaction.cashier_id || '',
                            total_discount : transaction.total_discount || '',
                            member_id : transaction.member_id || '',
                        });
                    }
                })
                .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            if (isEdit){
                await api.put(`/transactions/${id}`, formData);
            } else {
                await api.post('/transaction', formData);
            } 
            setSnackbar({
                open: true,
                message: isEdit ? 'Transaksi berhasil diperbarui!' : 'Transaksi baru berhasil ditambahkan!',
                severity: 'success'
            });
            setTimeout(() => {
                navigate('/operational/transactions');
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
        <MainCard title={isEdit ? "Edit Transaksi" : "Transaksi Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid  container spacing={3}>
                    <Grid size={{ xs: 12, sm: 3 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Barcode</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Barcode</b>
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Kategori Barang</b>
                        </Typography>
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
                            value={units.find((c)=> c.id === formData.unit_id) || null}
                            onChange={(event, newValue)=>{
                                setFormData({...formData, unit_id:newValue?.id || ''});
                            }}
                            renderInput={(params)=><TextField {...params} label="Unit" required />}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControlLabel
                        control={
                            <Switch
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            color="primary"
                            />
                        }
                        label="Tampilkan produk ini di kasih (aktif)"
                        />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/master/products')}
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

    
export default TransactionForm;
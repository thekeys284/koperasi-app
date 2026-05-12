import { useEffect, useState } from "react";
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
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        category_id:'',
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
        if (isEdit) { 
            setFetching(true);
            api.get(`/products/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const product = res.data.data;
                        setFormData({
                            category_id: product.category_id || '',
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
                navigate('/admin/products');
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
                            placeholder="Scan atau ketik barcode ..."
                            value={formData.barcode}
                            onChange={(e)=> setFormData({...formData, barcode:e.target.value})}
                            InputProps={{
                                startAdornment:(
                                    <InputAdornment position="start">
                                        <IconBarcode size="20"/>
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
                            onClick={() => navigate('/admin/products')}
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

    
export default ProductForm;
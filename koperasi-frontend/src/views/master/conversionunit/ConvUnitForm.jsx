import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch,
     Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';

const ConvUnitForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [units, setunits]=useState([]);
    const [fetching, setFetching] = useState(false);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        product_id: '',
        from_unit_id: '',
        to_unit_id: '',
        multiplier: '',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(()=>{
        api.get('/units').then(res => setunits(res.data.data || []));
        api.get('/products').then(res => setProducts(res.data.data || []));
        if (isEdit) { 
            setFetching(true);
            api.get(`/unitconversion/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const convUnit = res.data.data;
                        setFormData({
                            product_id: convUnit.product_id || '',
                            from_unit_id: convUnit.from_unit_id || '',
                            to_unit_id: convUnit.to_unit_id || '',
                            multiplier: convUnit.multiplier || '',
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
                await api.put(`/unitconversion/${id}`, formData);
            } else {
                await api.post('/unitconversion', formData);
            } 
            setSnackbar({
                open: true,
                message: isEdit ? 'Data konversi berhasil diperbarui!' : 'Konversi baru berhasil ditambahkan!',
                severity: 'success'
            });
            setTimeout(() => {
                navigate('/admin/conversionunit');
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
        <MainCard title={isEdit ? "Edit Konversi Unit" : "Tambah Konversi Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Pilih Produk</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select fullWidth label="Pilih Produk"
                            required
                            value={formData.product_id}
                            onChange={(e)=>setFormData({...formData, product_id: e.target.value})}>
                                {products.map((product) => (
                                    <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                                ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Unit Asal</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select fullWidth label="Unit Asal"
                            required
                            value={formData.from_unit_id}
                            onChange={(e)=>setFormData({...formData, from_unit_id:e.target.value})}>
                                {units.map((unit) => (
                                    <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                                ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Unit Tujuan</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select fullWidth label="Unit Tujuan"
                            required
                            value={formData.to_unit_id}
                            onChange={(e)=>setFormData({...formData, to_unit_id: e.target.value})}>
                                {units.map((unit) => (
                                    <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                                ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Multiplier</b>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth label="Multiplier (Pengali)" type="number"
                            required
                            value={formData.multiplier}
                            onChange={(e)=>setFormData({...formData, multiplier: e.target.value})}
                        />
                    </Grid>
                    
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/admin/conversionunit')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Konversi'}
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

    
export default ConvUnitForm;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch,
     Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';

const PaymentMethodForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
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
        if (isEdit) { 
            setFetching(true);
            api.get(`/payment-methods/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const paymentMethod = res.data.data;
                        setFormData({
                            name: paymentMethod.name || '',
                            description: paymentMethod.description || '',
                            is_active: paymentMethod.is_active,
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
                await api.put(`/payment-methods/${id}`, formData);
            } else {
                await api.post('/payment-methods', formData);
            } 
            setSnackbar({
                open: true,
                message: isEdit ? 'Data metode pembayaran berhasil diperbarui!' : 'Metode pembayaran baru berhasil ditambahkan!',
                severity: 'success'
            });
            setTimeout(() => {
                navigate('/master/payment-methods');
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
        <MainCard title={isEdit ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                            <strong>Nama Metode Pembayaran</strong>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <TextField
                            fullWidth
                            label="Nama Metode Pembayaran"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                            <strong>Deskripsi</strong>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <TextField
                            fullWidth
                            label="Deskripsi (Opsional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                            <strong>Status</strong>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    color="primary"
                                />
                            }
                            label="Aktifkan metode pembayaran"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate('/master/payment-methods')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Metode Pembayaran'}
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

    
export default PaymentMethodForm;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    TextField,
    Grid,
    MenuItem,
    Box,
    Typography,
    Autocomplete,
    InputAdornment,
    CircularProgress,
    Alert
} from "@mui/material";
import MainCard from 'ui-component/cards/MainCard';
import api from 'api/axios';

const PriceLogForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        product_id: null,
        old_price: '',
        new_price: '',
        change_type: '',
        reason: ''
    });
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await api.get('/products');
                
                // 💡 SOLUSI AMAN: Cek apakah data dibungkus dalam .data.data atau langsung .data
                if (response.data && Array.isArray(response.data.data)) {
                    setProducts(response.data.data);
                } else if (response.data && Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    setProducts([]);
                }
                console.log("Fetched products for Autocomplete:", response.data); // Debugging
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Gagal memuat daftar produk dari server.");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (isEdit && products.length > 0) {
            api.get(`/price-logs/${id}`)
                .then((res) => {
                    const priceLog = res.data.data;
                    setFormData({
                        product_id: priceLog.product_id,
                        old_price: priceLog.old_price,
                        new_price: priceLog.new_price,
                        change_type: priceLog.change_type,
                        reason: priceLog.reason || ''
                    });
                    const product = products.find(p => p.id === priceLog.product_id);
                    setSelectedProduct(product || null);
                })
                .catch(err => {
                    console.error("Gagal mengambil data price log", err);
                    setError("Gagal memuat data riwayat harga.");
                });
        }
    }, [id, isEdit, products]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.product_id || !formData.change_type || formData.old_price === '' || formData.new_price === '') {
            setError("Semua field wajib diisi kecuali alasan.");
            return;
        }

        const payload = {
            product_id: formData.product_id,
            old_price: parseFloat(formData.old_price),
            new_price: parseFloat(formData.new_price),
            change_type: formData.change_type,
            reason: formData.reason
        };

        try {
            if (isEdit) {
                await api.put(`/price-logs/${id}`, payload);
            } else {
                await api.post('/price-logs', payload);
            }
            navigate('/operational/pricelogs');
        } catch (err) {
            console.error("Gagal Menyimpan", err.response?.data || err.message);
            setError(err.response?.data?.message || "Gagal menyimpan riwayat harga.");
        }
    };

    return (
        <MainCard title={isEdit ? "Edit Riwayat Perubahan Harga" : "Tambah Riwayat Perubahan Harga Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {error && (
                        <Grid size={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                    
                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Produk</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 10 }}>
                        <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id} // Safe navigating
                            value={selectedProduct}
                            onChange={(event, newValue) => {
                                setSelectedProduct(newValue);
                                const newProductId = newValue ? newValue.id : null;
                                let newOldPrice = formData.old_price;

                                if (newValue && !isEdit) {
                                    newOldPrice = newValue.current_selling_price || '';
                                } else if (!newValue && !isEdit) {
                                    newOldPrice = '';
                                }

                                setFormData({ ...formData, product_id: newProductId, old_price: newOldPrice });
                            }}
                            loading={loadingProducts}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pilih Produk"
                                    fullWidth
                                    required
                                    slotProps={{
                                        input: {
                                            ...params.InputProps, // 💡 Pastikan ini ditaruh di baris paling atas objek
                                            endAdornment: (
                                                <>
                                                    {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Harga Lama</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Harga Lama"
                            type="number"
                            value={formData.old_price}
                            onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                            // 💡 KUNCI 2: Konversi InputProps lama ke slotProps.input modern
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                                    readOnly: !isEdit && formData.product_id !== null,
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': !isEdit && formData.product_id !== null ? { bgcolor: '#f5f5f5' } : {}
                            }}
                            required
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="body1"><b>Harga Baru</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="Harga Baru"
                            type="number"
                            value={formData.new_price}
                            onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                                }
                            }}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Tipe Perubahan</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 10 }}>
                        <TextField
                            select
                            fullWidth
                            label="Tipe Perubahan"
                            value={formData.change_type}
                            onChange={(e) => setFormData({ ...formData, change_type: e.target.value })}
                            required
                        >
                            <MenuItem value="SELLING_PRICE">Harga Jual</MenuItem>
                            <MenuItem value="PURCHASE_PRICE">Harga Beli</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1"><b>Alasan</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 10 }}>
                        <TextField
                            fullWidth
                            label="Alasan Perubahan (Opsional)"
                            multiline
                            rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'right', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate('/operational/pricelogs')}>
                                Batal
                            </Button>
                            <Button variant="contained" type="submit" color="primary">
                                Simpan
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </MainCard>
    );
};

export default PriceLogForm;

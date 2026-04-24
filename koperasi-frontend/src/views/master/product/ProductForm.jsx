import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, FormControlLabel, Switch} from "@mui/material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";
import { InputAdornment, IconButton} from "@mui/material";
import { IconArrowLeft, IconBarcode, IconDeviceFloppy } from '@tabler/icons-react';
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ProductForm = () =>{
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading]=useState(false);
    const [categories, setCategories]=useState([]);

    const [formData, setFormData] = useState({
        category_id:'',
        barcode:'',
        product_name:'',
        product_detail:'',
        current_selling_price:'',
        min_stock:'',
        is_active:'true'
    });

    useEffect(()=>{
        const fetchInitialData = async()=>{
            try{
                const resCat = await api.get('/categories');
                setCategories(resCat.data);
                if(isEdit){
                    const resProd = await api.get(`/products/${id}`);
                    const prod = resProd.data;
                    setFormData({
                        category_id: prod.category_id || '',
                        barcode : prod.barcode || '',
                        product_name : prod.product_name || '',
                        product_detail : prod.product_detail || '',
                        current_selling_price : prod.current_selling_price || '',
                        min_stock : prod.min_stock || '5',
                        is_active : prod.is_active === 1 || prod.is_active === true
                    });
                }
            } catch (error){
                console.error("Gagal memuat data:", error);
            }
        };

        fetchInitialData();
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
            navigate('/pjtoko/products');
        } catch(error){
            console.error("Gagal simpan produk:", error.response?.data || error.message);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard
            title={isEdit? "Edit Informasi Barang" : "Tambah Barang Baru"}
            secondary={
                <Button
                    variant="text"
                    startIcon={<IconArrowLeft />}
                    onClick={()=> navigate('/pjtoko/product')}
                >
                    Kembali
                </Button>
            }
        >
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
                            getOptionLabel={(option) => option.category_name || ''}
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
                            value={formData.product_name}
                            onChange={(e)=> setFormData({...formData, product_name:e.target.value})}
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
                            value={formData.product_detail}
                            onChange={(e)=>setFormData({...formData, product_detail:e.target.value})}
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
                            value={formData.current_selling_price}
                            onChange={(e)=>setFormData({...formData, current_selling_price:e.target.value})}
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
                            onClick={() => navigate('/pjtoko/stock')}
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
        </MainCard>

    );
};

    
export default ProductForm;

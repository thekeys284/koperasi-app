import { useNavigate } from 'react-router-dom';
import {useEffect,useState} from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Typography, TableContainer,
    Paper, CircularProgress, Box, Chip, Button, TextField, InputAdornment, TablePagination,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert
} from '@mui/material';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconPackage } from '@tabler/icons-react';
import MainCard from '../../../components/cards/MainCard.jsx';
import api from '@/api/axios';

const ProductPage = () => {
    const navigate = useNavigate();
    const [ products, setProducts ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ openDelete, setOpenDelete ] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ page, setPage ] = useState(0);
    const [ rowsPerPage, setRowsPerPage ] = useState(10);
    const [snackbar, setSnackbar ] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            const results = response.data.data || [];
            setProducts(results);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // filer dan pagination
    const filteredProducts = products.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.includes(searchTerm)
    );
    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    // Fungsi buka popup
    const handleOpenDelete = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    // Fungsi tutup popup
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setSelectedId(null);
    };

    const handleAdd = () => {
        navigate('/master/products/add');
    };

    const handleEdit = (id) => {
        console.log("Edit product ID:", id);
        navigate(`/master/products/edit/${id}`);
    };
    const handleDelete = async () => {
            try {
                await api.delete(`/products/${selectedId}`);
                setProducts(prev => prev.filter(product => product.id !== selectedId));
                handleCloseDelete();
                setSnackbar({
                    open: true,
                    message: 'Data produk berhasil dihapus!',
                    severity: 'success'
                });
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Gagal menghapus data',
                    severity: 'error'
                });
            }
        };

    return (
        <MainCard title="Daftar Barang">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder='Cari Barang atau Barcode'
                    size='small'
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconSearch size="18" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 200, flex: 1, maxWidth: 400 }} // field bisa fleksibel tapi tetap maksimal 400px
                />
                <Button variant='contained' color='primary' onClick={handleAdd}>
                    Tambah Barang
                </Button>
            </Box>
        {loading ? (
            <Box sx={{ textAlign: 'center', p: 5}}><CircularProgress /></Box>
        ):(
            <Paper sx={{ width: '100%', overflow:'hidden', boxShadow:'none'}}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Barcode</TableCell>
                                <TableCell>Nama Produk</TableCell>
                                <TableCell align='center'>Minimum Stok</TableCell>
                                <TableCell align='right'>Harga Jual</TableCell>
                                <TableCell align='center'>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProducts.length > 0 ?(
                                paginatedProducts.map((row)=>(
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.barcode}</TableCell>
                                        <TableCell>
                                            <Typography variant='subtitle2'>{row.name}</Typography>
                                            <Typography variant='caption'>{row.category?.category_name}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography color={row.min_stock <= row.min_stock ? 'error' : 'inherit'}>
                                                {row.min_stock || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align='right'>
                                            Rp {new Intl.NumberFormat('id-ID').format(row.price)}
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Button size='small' onClick={()=>navigate(`/master/products/edit/${row.id}`)}>
                                                <IconEdit size={16}/>
                                            </Button>
                                            <Button size='small' color='error'
                                                onClick={async () => {
                                                    if(window.confirm('Yakin ingin menghapus produk ini?')) {
                                                    try {
                                                        await api.delete(`/products/${row.id}`);
                                                        fetchProducts(); // refresh tabel
                                                    } catch(err) {
                                                        console.error('Gagal menghapus produk', err);
                                                    }
                                                    }
                                                }}>
                                                <IconTrash size='16'/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))):(
                                    <TableRow>
                                        <TableCell colSpan={5} align='center' sx={{py:3}}>Data tidak ditemukan</TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5,10,25]}
                    component='div'
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Data per halaman"
                />
            </Paper>
        )
        }
        <Dialog
                open={openDelete}
                onClose={handleCloseDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                // Agar sudutnya melengkung khas Berry
                PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
                    Konfirmasi Hapus
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDelete} color="primary" variant="outlined">
                        Batal
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                        Ya, Hapus
                    </Button>
                </DialogActions>
            </Dialog>
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

export default ProductPage;
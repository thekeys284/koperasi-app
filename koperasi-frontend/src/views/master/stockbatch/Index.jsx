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

const StockBatchPage = () => {
    const navigate = useNavigate();
    const [ stockbatch, setStockbatch ] = useState([]);
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
        fetchStockBatch();
    }, []);

    const fetchStockBatch = async () => {
        try {
            setLoading(true);
            const response = await api.get('/stockbatch');
            const results = response.data.data || [];
            setStockbatch(results);
        } catch (error) {
            console.error("Gagal mengambil data stock:", error);
            setStockbatch([]);
        } finally {
            setLoading(false);
        }
    };

    // filer dan pagination
    const filteredStockbatch = stockbatch.filter((item) =>
        (item.product?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (item.barcode || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );
    const paginatedStockbatch = filteredStockbatch.slice(
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
        navigate('/master/stocks/add');
    };

    const handleEdit = (id) => {
        console.log("Edit Stock ID:", id);
        navigate(`/master/stocks/edit/${id}`);
    };
    const handleDelete = async () => {
            try {
                await api.delete(`/stockbatch/${selectedId}`);
                setStockbatch(prev => prev.filter(product => product.id !== selectedId));
                handleCloseDelete();
                setSnackbar({
                    open: true,
                    message: 'Data produk berhasil dihapus!',
                    severity: 'success'
                });
            } catch (error) {
                handleCloseDelete();
                setSnackbar({
                    open: true,
                    message: error.response?.data?.message || 'Gagal menghapus data',
                    severity: 'error'
                });
            }
        };

    return (
        <MainCard title="Daftar Stock Barang">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder='Cari Stock Barang'
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
                    sx={{ minWidth: 200, flex: 1, maxWidth: 400 }}
                />
                <Button variant='contained' color='primary' onClick={handleAdd}>
                    Tambah Stock Barang
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
                                <TableCell align='center'>Nama Produk</TableCell>
                                <TableCell align='center'>Sisa Stock</TableCell>
                                <TableCell align='center'>Harga Beli (Kulakan)</TableCell>
                                <TableCell align='center'>Expiry Date</TableCell>
                                <TableCell align='center'>Tanggal Input</TableCell>
                                <TableCell align='center'>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedStockbatch.length > 0 ?(
                                paginatedStockbatch.map((row)=>(
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.product?.name || 'Produk Tidak Diketahui'}</TableCell>
                                        <TableCell  align='center'>
                                            <Typography variant='subtitle2'>{row.remaining_qty}</Typography>
                                        </TableCell>
                                        <TableCell  align='center'>
                                            <Typography variant='subtitle2'>{row.purchase_price}</Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Typography color={row.expiry_date <= row.expiry_date ? 'error' : 'inherit'}>
                                                {row.expiry_date || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Typography variant='body2' color='textSecondary'>
                                                {row.received_at || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Button size='small' onClick={()=>navigate(`/master/stocks/edit/${row.id}`)}>
                                                <IconEdit size={16}/>
                                            </Button>
                                            <Button size='small' color='error' onClick={() => handleOpenDelete(row.id)}>
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
                    count={filteredStockbatch.length}
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
                        Apakah Anda yakin ingin menghapus stock produk ini? Tindakan ini tidak dapat dibatalkan.
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

export default StockBatchPage;
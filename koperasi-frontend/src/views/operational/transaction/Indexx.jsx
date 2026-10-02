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

const TransactionPage = () => {
    const navigate = useNavigate();
    const [ transaction, setTransaction] = useState([]);
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
        fetchTransaction();
    }, []);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const response = await api.get('/transactions');
            const results = response.data.data || [];
            setTransaction(results);
        } catch (error) {
            console.error("Gagal mengambil data transaction:", error);
            setTransaction([]);
        } finally {
            setLoading(false);
        }
    };

    // filer dan pagination
    const filteredTransaction = transaction.filter((item) =>
        item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paginatedTransaction = filteredTransaction.slice(
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
        navigate('/operational/transactions/add');
    };

    const handleEdit = (id) => {
        console.log("Edit transaction ID:", id);
        navigate(`/operational/transactions/edit/${id}`);
    };
    const handleDelete = async () => {
            try {
                await api.delete(`/transactions/${selectedId}`);
                setTransaction(prev => prev.filter(transaction => transaction.id !== selectedId));
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
        <MainCard title="Daftar Transaksi">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder='Cari Invoice'
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
                    Transaksi Baru
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
                                <TableCell>Invoice</TableCell>
                                <TableCell>Nama Customer</TableCell>
                                <TableCell align='center'>Total Tagihan</TableCell>
                                <TableCell align='right'>Tanggal Transaksi</TableCell>
                                <TableCell align='center'>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedTransaction.length > 0 ?(
                                paginatedTransaction.map((row)=>(
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Typography variant='subtitle2'>{row.invoice_number}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='subtitle2'>{row.member?.name}</Typography>
                                        </TableCell>
                                        <TableCell align='right'>
                                            Rp {new Intl.NumberFormat('id-ID').format(row.total_bill)}
                                        </TableCell>
                                        <TableCell align='right'>
                                            <Typography variant='subtitle2'>{row.transaction_date}</Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Button size='small' onClick={()=>navigate(`/operational/transactions/edit/${row.id}`)}>
                                                <IconEdit size={16}/>
                                            </Button>
                                            <Button size='small' color='error'
                                                onClick={async () => {
                                                    if(window.confirm('Yakin ingin menghapus Transaksi ini?')) {
                                                    try {
                                                        await api.delete(`/transactions/${row.id}`);
                                                        fetchTransaction(); // refresh tabel
                                                    } catch(err) {
                                                        console.error('Gagal menghapus transaksi', err);
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
                    count={filteredTransaction.length}
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
                        Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
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

export default TransactionPage;
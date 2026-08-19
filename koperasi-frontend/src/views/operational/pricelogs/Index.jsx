import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Typography, TableContainer, Paper, CircularProgress, Box, Chip, Button, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Pagination
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard'; 
import api from 'api/axios'; 
import { formatCurrency, formatDate } from '../../../utils/format'; 
// 💡 FIXED: Impor nama ikon Material UI yang terbalik
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PriceLogIndexPage = () => {
    const navigate = useNavigate();

    const [priceLogs, setPriceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Paginasi State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [priceLogToDelete, setPriceLogToDelete] = useState(null);

    useEffect(() => {
        fetchPriceLogs(page);
    }, [page]);

    const fetchPriceLogs = async (pageNumber) => {
        try {
            setLoading(true);
            const response = await api.get(`/price-logs?page=${pageNumber}`);
            
            // 💡 FIXED: Membaca struktur standard Resource Collection Paginate Laravel
            setPriceLogs(response.data.data || []); 
            setTotalPages(response.data.meta?.last_page || 1);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengambil data riwayat harga.");
            console.error("Error fetching price logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        navigate('/operational/pricelogs/add'); 
    };

    const handleEdit = (id) => {
        navigate(`/operational/pricelogs/edit/${id}`); 
    };

    const handleDeleteClick = (id) => {
        setPriceLogToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!priceLogToDelete) return;
        try {
            await api.delete(`/price-logs/${priceLogToDelete}`); 
            fetchPriceLogs(page);
            setDeleteDialogOpen(false);
            setPriceLogToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menghapus riwayat harga.");
            console.error("Error deleting price log:", err);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const getChangeTypeLabel = (type) => {
        switch (type) {
            case 'SELLING_PRICE': return 'Harga Jual';
            case 'PURCHASE_PRICE': return 'Harga Beli';
            default: return type;
        }
    };

    const getChangeTypeColor = (type) => {
        switch (type) {
            case 'SELLING_PRICE': return 'primary';
            case 'PURCHASE_PRICE': return 'info';
            default: return 'default';
        }
    };

    return (
        <MainCard title="Riwayat Perubahan Harga Produk">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant='contained' color='primary' onClick={handleAdd}>
                    Tambah Riwayat Harga
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
                    <CircularProgress size={30} />
                    <Typography sx={{ ml: 2 }}>Memuat data riwayat harga...</Typography>
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ p: 3 }}>{error}</Typography>
            ) : (
                <>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="price logs table">
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell><strong>Produk</strong></TableCell>
                                    <TableCell><strong>Diubah Oleh</strong></TableCell>
                                    <TableCell align="right"><strong>Harga Lama</strong></TableCell>
                                    <TableCell align="right"><strong>Harga Baru</strong></TableCell>
                                    <TableCell align="center"><strong>Tipe Perubahan</strong></TableCell>
                                    <TableCell><strong>Alasan</strong></TableCell>
                                    <TableCell><strong>Tanggal Perubahan</strong></TableCell>
                                    <TableCell align="center"><strong>Aksi</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {priceLogs.length > 0 ? (
                                    priceLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{log.product_name || log.product?.name}</TableCell>
                                            <TableCell>{log.user_name || log.user?.name}</TableCell>
                                            <TableCell align="right">{formatCurrency(log.old_price)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'teal.main' }}>
                                                {formatCurrency(log.new_price)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={getChangeTypeLabel(log.change_type)}
                                                    color={getChangeTypeColor(log.change_type)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{log.reason || '-'}</TableCell>
                                            <TableCell>{formatDate(log.changed_at)}</TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <IconButton color="primary" size="small" onClick={() => handleEdit(log.id)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton color="error" size="small" onClick={() => handleDeleteClick(log.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                                            Tidak ada data riwayat perubahan harga.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Kontrol Paginasi Halaman */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handlePageChange} 
                            color="primary" 
                            size="small"
                        />
                    </Box>
                </>
            )}

            {/* Dialog Konfirmasi Hapus */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                slotProps={{
                    backdrop: { style: { borderRadius: '8px' } }
                }}
            >
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogContent>
                    <Typography>
                        Apakah Anda yakin ingin menghapus riwayat perubahan harga ini secara permanen?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" size="small">
                        Batal
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" size="small" autoFocus>
                        Hapus
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default PriceLogIndexPage;
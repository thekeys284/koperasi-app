import { Fragment, useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Typography, TableContainer,
    Paper, CircularProgress, Box, TextField, InputAdornment, TablePagination,
    Grid, Chip, Collapse, IconButton
} from '@mui/material';
import { IconSearch, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import MainCard from '../../../components/cards/MainCard.jsx';
import api from '@/api/axios.js';

const formatRupiah = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;

const PurchaseRecapPage = () => {
    const [recap, setRecap] = useState([]);
    const [summary, setSummary] = useState({ total_anggota_belanja: 0, total_omzet: 0, total_transaksi: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [detailData, setDetailData] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchRecap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const fetchRecap = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const response = await api.get('/purchases/recap', { params });
            setRecap(response.data.data || []);
            setSummary(response.data.summary || {});
        } catch (error) {
            console.error('Gagal mengambil rekap pembelian user:', error);
            setRecap([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDetail = async (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            return;
        }
        setExpandedUserId(userId);
        try {
            setDetailLoading(true);
            const params = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const response = await api.get(`/purchases/recap/${userId}`, { params });
            setDetailData(response.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil detail transaksi user:', error);
            setDetailData([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredRecap = recap.filter((item) =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const paginatedRecap = filteredRecap.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <MainCard title="Rekap Pembelian per Anggota">
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        placeholder="Cari nama / username..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconSearch size="18" />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={6} sm={2}>
                    <TextField
                        fullWidth size="small" type="date" label="Dari Tanggal"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6} sm={2}>
                    <TextField
                        fullWidth size="small" type="date" label="Sampai Tanggal"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Total Anggota Belanja</Typography>
                        <Typography variant="h4">{summary.total_anggota_belanja || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Total Transaksi</Typography>
                        <Typography variant="h4">{summary.total_transaksi || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Total Omzet</Typography>
                        <Typography variant="h4">{formatRupiah(summary.total_omzet)}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ textAlign: 'center', p: 5 }}><CircularProgress /></Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none' }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Nama Anggota</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell align="center">Jumlah Transaksi</TableCell>
                                    <TableCell align="right">Total Belanja</TableCell>
                                    <TableCell>Belanja Terakhir</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRecap.length > 0 ? (
                                    paginatedRecap.map((row) => (
                                        <>
                                            <TableRow key={row.user_id} hover>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleToggleDetail(row.user_id)}>
                                                        {expandedUserId === row.user_id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.username}</TableCell>
                                                <TableCell align="center">
                                                    <Chip label={row.total_transaksi} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">{formatRupiah(row.total_belanja)}</TableCell>
                                                <TableCell>{row.last_purchase_at ? new Date(row.last_purchase_at).toLocaleString('id-ID') : '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                    <Collapse in={expandedUserId === row.user_id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ m: 1 }}>
                                                            {detailLoading ? (
                                                                <CircularProgress size={20} />
                                                            ) : (
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Invoice</TableCell>
                                                                            <TableCell>Tanggal</TableCell>
                                                                            <TableCell>Metode Bayar</TableCell>
                                                                            <TableCell>Barang Dibeli</TableCell>
                                                                            <TableCell align="right">Total</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {detailData.length ? detailData.map((transaction) => (
                                                                            <Fragment key={transaction.id}>
                                                                                <TableRow>
                                                                                    <TableCell>{transaction.invoice_number}</TableCell>
                                                                                    <TableCell>{new Date(transaction.transaction_date).toLocaleString('id-ID')}</TableCell>
                                                                                    <TableCell>{transaction.payment_method?.name || '-'}</TableCell>
                                                                                    <TableCell sx={{ minWidth: 300 }}>
                                                                                        {transaction.items?.length ? (
                                                                                            <Table size="small" aria-label={`Rincian ${transaction.invoice_number}`}>
                                                                                                <TableHead>
                                                                                                    <TableRow>
                                                                                                        <TableCell>Produk</TableCell>
                                                                                                        <TableCell align="right">Jumlah</TableCell>
                                                                                                        <TableCell align="right">Harga</TableCell>
                                                                                                        <TableCell align="right">Subtotal</TableCell>
                                                                                                    </TableRow>
                                                                                                </TableHead>
                                                                                                <TableBody>
                                                                                                    {transaction.items.map((item) => (
                                                                                                        <TableRow key={item.id}>
                                                                                                            <TableCell>{item.product?.name || 'Produk tidak ditemukan'}</TableCell>
                                                                                                            <TableCell align="right">{item.qty_input} {item.unit?.name || 'Pcs'}</TableCell>
                                                                                                            <TableCell align="right">{formatRupiah(item.normal_price)}</TableCell>
                                                                                                            <TableCell align="right">{formatRupiah(item.final_price)}</TableCell>
                                                                                                        </TableRow>
                                                                                                    ))}
                                                                                                </TableBody>
                                                                                            </Table>
                                                                                        ) : 'Tidak ada rincian barang.'}
                                                                                    </TableCell>
                                                                                    <TableCell align="right">{formatRupiah(transaction.total_bill)}</TableCell>
                                                                                </TableRow>
                                                                            </Fragment>
                                                                        )) : (
                                                                            <TableRow>
                                                                                <TableCell colSpan={5} align="center">Tidak ada transaksi pada periode ini.</TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            )}
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            Belum ada data pembelian.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredRecap.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        labelRowsPerPage="Data per halaman"
                    />
                </Paper>
            )}
        </MainCard>
    );
};

export default PurchaseRecapPage;

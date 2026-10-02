import { useEffect, useState } from 'react';
import {
    Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Collapse, IconButton, Pagination, Stack
} from '@mui/material';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import MainCard from '../../../components/cards/MainCard.jsx';
import api from '@/api/axios.js';

const formatRupiah = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;

const MyPurchaseHistoryPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchMyPurchases(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchMyPurchases = async (pageNumber) => {
        try {
            setLoading(true);
            const response = await api.get(`/me/purchases?page=${pageNumber}`);
            setPurchases(response.data.data || []);
            setTotalPages(response.data.meta?.last_page || 1);
        } catch (error) {
            console.error('Gagal mengambil riwayat belanja saya:', error);
            setPurchases([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard title="Riwayat Belanja Saya">
            {!loading && purchases.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.lighter', boxShadow: 'none' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}>
                        <Box>
                            <Typography variant="subtitle1">Semua struk belanja Anda</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tekan ikon panah pada struk untuk melihat barang, jumlah, harga, dan subtotal.
                            </Typography>
                        </Box>
                        <Chip label={`${purchases.length} struk di halaman ini`} color="primary" size="small" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                    </Stack>
                </Paper>
            )}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Memuat riwayat belanja...</Typography>
                </Box>
            ) : purchases.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    Anda belum memiliki riwayat belanja.
                </Typography>
            ) : (
                <>
                    <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell />
                                    <TableCell><strong>Invoice</strong></TableCell>
                                    <TableCell><strong>Tanggal</strong></TableCell>
                                    <TableCell><strong>Metode Bayar</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                    <TableCell align="right"><strong>Total</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {purchases.map((sale) => (
                                    <>
                                        <TableRow key={sale.id} hover>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                                                >
                                                    {expandedId === sale.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{sale.invoice_number}</TableCell>
                                            <TableCell>{sale.transaction_date}</TableCell>
                                            <TableCell>{sale.payment_method?.name || '-'}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={sale.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                                    color={sale.payment_status === 'paid' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{formatRupiah(sale.total_bill)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                <Collapse in={expandedId === sale.id} timeout="auto" unmountOnExit>
                                                    <Box sx={{ m: 1 }}>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Produk</TableCell>
                                                                    <TableCell align="center">Qty</TableCell>
                                                                    <TableCell align="right">Harga</TableCell>
                                                                    <TableCell align="right">Subtotal</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {(sale.items || []).map((item) => (
                                                                    <TableRow key={item.id}>
                                                                        <TableCell>{item.product?.name || '-'}</TableCell>
                                                                        <TableCell align="center">
                                                                            {item.qty_input} {item.unit?.name || ''}
                                                                        </TableCell>
                                                                        <TableCell align="right">{formatRupiah(item.normal_price)}</TableCell>
                                                                        <TableCell align="right">{formatRupiah(item.final_price)}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="small"
                        />
                    </Box>
                </>
            )}
        </MainCard>
    );
};

export default MyPurchaseHistoryPage;

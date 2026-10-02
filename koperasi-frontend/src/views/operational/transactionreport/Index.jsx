import { useEffect, useState } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { IconDownload, IconSearch } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import MainCard from 'ui-component/cards/MainCard';
import api from '@/api/axios.js';
import { getCurrentRole, ROLES } from '@/utils/auth.js';

const rupiah = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;
const now = new Date();
const monthOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const yearOptions = Array.from({ length: 6 }, (_, index) => now.getFullYear() - index);

export default function TransactionReportPage() {
  const canBulkUpdate = [ROLES.ADMIN, ROLES.PJ_TOKO].includes(getCurrentRole());
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [filters, setFilters] = useState({ month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, paymentMethodId: '' });
  const [methods, setMethods] = useState([]);
  const [report, setReport] = useState({ data: { debts: [], transactions: [] }, summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [newPaymentStatus, setNewPaymentStatus] = useState('paid');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/transactions/monthly', { params: { month: filters.month, ...(filters.paymentMethodId && { payment_method_id: filters.paymentMethodId }) } });
      setReport(response.data);
      setSelectedIds([]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Laporan transaksi gagal dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/payment-methods').then((response) => setMethods(response.data?.data || response.data || [])).catch(() => setMethods([]));
  }, []);
  useEffect(() => { loadReport(); }, [filters]);

  const applyFilters = () => {
    setFilters({ month: `${selectedYear}-${selectedMonth}`, paymentMethodId });
  };

  const toggleSelected = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === (report.data?.transactions || []).length ? [] : (report.data?.transactions || []).map((transaction) => transaction.id));
  const updatePaymentStatus = async () => {
    setUpdating(true);
    try {
      await api.patch('/reports/transactions/payment-status', { month: filters.month, sale_ids: selectedIds, payment_status: newPaymentStatus });
      setConfirmOpen(false);
      await loadReport();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Status pembayaran gagal diperbarui.');
    } finally {
      setUpdating(false);
    }
  };

  const downloadExcel = () => {
    const rows = (report.data?.transactions || []).map((transaction) => ({
      Anggota: transaction.member_name,
      Struk: transaction.invoice_number,
      Tanggal: transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleString('id-ID') : '-',
      'Cara Pembayaran': transaction.payment_method,
      'Status Pembayaran': String(transaction.payment_status || '').toLowerCase() === 'paid' ? 'Lunas' : 'Belum Lunas',
      'Total Struk': transaction.total_bill,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 24 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 20 }, { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Transaksi');
    XLSX.writeFile(workbook, `rekap-transaksi-${filters.month}.xlsx`);
  };

  const summary = report.summary || {};
  return <MainCard title="Laporan Transaksi & Hutang Tempo Bulanan">
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth select size="small" label="Bulan" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>{monthOptions.map((name, index) => <MenuItem key={name} value={String(index + 1).padStart(2, '0')}>{name}</MenuItem>)}</TextField></Grid>
      <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth select size="small" label="Tahun" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>{yearOptions.map((year) => <MenuItem key={year} value={String(year)}>{year}</MenuItem>)}</TextField></Grid>
      <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth select size="small" label="Cara Pembayaran" value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}><MenuItem value="">Semua cara pembayaran</MenuItem>{methods.map((method) => <MenuItem key={method.id} value={method.id}>{method.name}</MenuItem>)}</TextField></Grid>
      <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' }, alignItems: 'center', flexWrap: 'wrap' }}><Button startIcon={<IconSearch size={18} />} variant="outlined" onClick={applyFilters}>Cek Laporan</Button><Button startIcon={<IconDownload size={18} />} variant="contained" onClick={downloadExcel} disabled={!report.data?.transactions?.length}>Unduh Excel</Button></Grid>
    </Grid>
    {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
    <Grid container spacing={2} sx={{ mb: 3 }}>{[['Total Transaksi', summary.total_transactions || 0], ['Omzet', rupiah(summary.total_omzet)], ['Total Hutang', rupiah(summary.total_hutang)], ['Anggota Berhutang', summary.total_anggota_berhutang || 0]].map(([label, value]) => <Grid key={label} size={{ xs: 6, md: 3 }}><Paper variant="outlined" sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h5">{value}</Typography></Paper></Grid>)}</Grid>
    <Typography variant="h5" sx={{ mb: 1 }}>Rekap Transaksi Bulanan</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Menampilkan seluruh transaksi sesuai periode dan cara pembayaran yang dipilih.</Typography>
    {canBulkUpdate && <Grid container spacing={1} sx={{ mb: 1, alignItems: 'center' }}><Grid><TextField select size="small" label="Ubah status menjadi" value={newPaymentStatus} onChange={(event) => setNewPaymentStatus(event.target.value)}><MenuItem value="paid">Lunas</MenuItem><MenuItem value="unpaid">Belum Lunas</MenuItem></TextField></Grid><Grid><Button variant="contained" disabled={!selectedIds.length} onClick={() => setConfirmOpen(true)}>Ubah {selectedIds.length} Status</Button></Grid></Grid>}
    <Table size="small"><TableHead><TableRow>{canBulkUpdate && <TableCell padding="checkbox"><Checkbox checked={Boolean(report.data?.transactions?.length) && selectedIds.length === report.data.transactions.length} indeterminate={selectedIds.length > 0 && selectedIds.length < (report.data?.transactions?.length || 0)} onChange={toggleAll} /></TableCell>}<TableCell>Anggota</TableCell><TableCell>Struk</TableCell><TableCell>Tanggal</TableCell><TableCell>Cara Pembayaran</TableCell><TableCell>Status Pembayaran</TableCell><TableCell align="right">Total Struk</TableCell></TableRow></TableHead><TableBody>{loading ? <TableRow><TableCell colSpan={canBulkUpdate ? 7 : 6} align="center">Memuat laporan…</TableCell></TableRow> : report.data?.transactions?.length ? report.data.transactions.map((transaction) => <TableRow key={transaction.id} selected={canBulkUpdate && selectedIds.includes(transaction.id)}>{canBulkUpdate && <TableCell padding="checkbox"><Checkbox checked={selectedIds.includes(transaction.id)} onChange={() => toggleSelected(transaction.id)} /></TableCell>}<TableCell>{transaction.member_name}</TableCell><TableCell>{transaction.invoice_number}</TableCell><TableCell>{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleString('id-ID') : '-'}</TableCell><TableCell>{transaction.payment_method}</TableCell><TableCell>{String(transaction.payment_status || '').toLowerCase() === 'paid' ? 'Lunas' : 'Belum Lunas'}</TableCell><TableCell align="right">{rupiah(transaction.total_bill)}</TableCell></TableRow>) : <TableRow><TableCell colSpan={canBulkUpdate ? 7 : 6} align="center">Tidak ada transaksi pada periode ini.</TableCell></TableRow>}</TableBody></Table>
    {canBulkUpdate && <Dialog open={confirmOpen} onClose={() => !updating && setConfirmOpen(false)}><DialogTitle>Konfirmasi perubahan status</DialogTitle><DialogContent>Ubah status pembayaran {selectedIds.length} struk pada periode {filters.month} menjadi <strong>{newPaymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}</strong>?</DialogContent><DialogActions><Button disabled={updating} onClick={() => setConfirmOpen(false)}>Batal</Button><Button disabled={updating} variant="contained" onClick={updatePaymentStatus}>{updating ? 'Menyimpan…' : 'Ya, Ubah Status'}</Button></DialogActions></Dialog>}
  </MainCard>;
}

import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from "../../../api/axios";

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    Breadcrumbs,
    Link,
    CircularProgress,
    Alert,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material';

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DownloadIcon from "@mui/icons-material/Download";
import {
    IconUser,
    IconFileText,
    IconShieldCheck,
    IconCalendar,
    IconCircleCheck,
    IconCircleX,
    IconDots,
    IconLock,
    IconWallet,
    IconX,
    IconEdit,
    IconClipboardList
} from '@tabler/icons-react';
import { color } from 'framer-motion';

const LeadLoanDetailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [loan, setLoan] = React.useState(null);

    const [openReject, setOpenReject] = React.useState(false);
    const [reason, setReason] = React.useState('');

    const loanId = searchParams.get("loan_id");
    const userId = searchParams.get("user_id") || "1";

    const fetchLoanDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/loans/${loanId}`, {
                params: {
                    all: 1,
                    user_id: userId,
                },
            });
            setLoan(response.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengambil detail pinjaman.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (loanId) {
            fetchLoanDetail();
        }
    }, [loanId, userId]);

    const handleOpenReject = () => setOpenReject(true);
    const handleCloseReject = () => setOpenReject(false);

    const handleSendApprove = async () => {
        try {
            const response = await api.patch(`/loans/${loanId}/approve`, {
                user_id: userId
            });
            if (response.data.success) {
                alert("Pengajuan berhasil disetujui!");
                fetchLoanDetail();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyetujui pengajuan.");
        }
    };

    const handleSendReject = async () => {
        if (!reason.trim()) {
            alert("Alasan penolakan wajib diisi.");
            return;
        }
        try {
            const response = await api.patch(`/loans/${loanId}/reject`, {
                user_id: userId,
                reason: reason
            });
            if (response.data.success) {
                alert("Pengajuan berhasil ditolak.");
                handleCloseReject();
                fetchLoanDetail();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menolak pengajuan.");
        }
    };

    const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;
    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
            {/* BREADCRUMB */}
            <Breadcrumbs
                aria-label="breadcrumb"
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 2 }}
            >
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate("/lead/loans")}
                    sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                    Daftar Pengajuan
                </Link>
                <Typography color="text.primary">Detail Pengajuan</Typography>
            </Breadcrumbs>

            {/* LOADING PAGE */}
            {loading && (
                <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                    <CircularProgress size={20} />
                    <Typography color="text.secondary">Memuat detail pengajuan...</Typography>
                </Stack>
            )}

            {!loading && error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {/* HEADER STATUS TAHAPAN PENGAJUAN */}
            <Card sx={{
                borderRadius: 4,
                mb: 3,
                boxShadow: 'none',
                border: '1px solid #E5E7EB'
            }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#FFF8E1', color: '#F59E0B', width: 44, height: 44 }}>
                                <IconClipboardList size="1.3rem" />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={500} sx={{ color: '#94A3B8'}}>
                                    {loan?.loan_number ? `#${loan.loan_number}` : "-"}
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E293B', mt: 0.2 }}>
                                    {loan?.status === 'aktif' ? 'Pinjaman Aktif' : 'Menunggu Persetujuan Ketua 1'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Box sx={{
                            bgcolor: '#F1F5F9',
                            px: 2,
                            py: 0.8,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <IconCalendar size="1rem" color="#64748B" />
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                Update: {formatDate(loan?.updated_at || loan?.created_at)}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                <Stack spacing={3}>
                    {/* INFORMASI ANGGOTA */}
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <IconUser size="1.1rem" color="#1e293b" />
                                <Typography variant="h4" fontWeight={700}>Informasi Anggota</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Nama Anggota</Typography>
                                    <Typography variant="h4" fontWeight={600}>{loan?.user_name || "-"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">ID/Username</Typography>
                                    <Typography variant="h4" fontWeight={600}>{loan?.user_username || "-"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Unit Kerja</Typography>
                                    <Typography variant="h4" fontWeight={600}>Biro SDM</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Gaji Pokok</Typography>
                                    <Typography variant="h4" fontWeight={600}>Rp 4.500.000</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* DETAIL PINJAMAN */}
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <IconFileText size="1.1rem" color="#1e293b" />
                                <Typography variant="h4" fontWeight={700}>Detail Pinjaman</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Jenis Pinjaman</Typography>
                                    <Box mt={0.5}>
                                        <Chip
                                            label={String(loan?.type || "Konsumtif").toUpperCase()}
                                            size="small"
                                            sx={{ bgcolor: '#F3E8FF', color: '#9333EA', fontWeight: 700 }}
                                        />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Jumlah Pinjaman</Typography>
                                    <Typography variant="h4" fontWeight={700} color="primary">{formatCurrency(loan?.jumlah_pinjaman)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tenor</Typography>
                                    <Typography variant="h4" fontWeight={600}>{loan?.lama_pembayaran} Bulan</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tanggal Pengajuan</Typography>
                                    <Typography variant="h4" fontWeight={600}>{formatDate(loan?.created_at)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Potong Gaji</Typography>
                                    <Typography variant="h4" fontWeight={600}>{loan?.bulan_potong_gaji || "-"}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Stack>

                {/* RIGHT COLUMN: ACTION */}
                <Stack spacing={3}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <IconShieldCheck size="1.1rem" color="#1e293b" />
                                <Typography variant="h4" fontWeight={700}>Aksi Persetujuan</Typography>
                            </Stack>

                            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 3, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>PENINJAU SAAT INI</Typography>
                                <Stack direction="row" spacing={2} mt={1}>
                                    <Avatar sx={{ bgcolor: '#DBEAFE', color: '#2563EB', width: 40, height: 40 }}>
                                        <IconUser size="1.2rem" />
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={14}>Bpk. Heru Wijaya</Typography>
                                        <Typography variant="caption" color="text.secondary">Ketua 1 Koperasi</Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            <Stack spacing={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSendApprove}
                                    startIcon={<IconCircleCheck size="1rem" />}
                                    sx={{
                                        bgcolor: '#35975aff',
                                        py: 1.2,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: '#50cb7fff' }
                                    }}
                                >
                                    Setujui Pengajuan
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    onClick={handleOpenReject}
                                    startIcon={<IconCircleX size="1rem" />}
                                    sx={{
                                        py: 1.2,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderWidth: 2,
                                        '&:hover': { borderWidth: 2 }
                                    }}
                                >
                                    Tolak Pengajuan
                                </Button>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="caption" fontWeight={700} color="text.secondary">ALUR PERSETUJUAN</Typography>
                            <Stack spacing={2} mt={2}>
                                {/* KETUA 1 */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ 
                                        bgcolor: loan?.status_pengajuan === 'pending' ? '#FFF8E1' : '#DCFCE7', 
                                        color: loan?.status_pengajuan === 'pending' ? '#F59E0B' : '#16A34A', 
                                        width: 32, height: 32 
                                    }}>
                                        {loan?.status_pengajuan === 'pending' ? <IconDots size="1rem" /> : <IconCircleCheck size="1rem" />}
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={13}>Ketua 1</Typography>
                                        <Typography variant="caption" color={loan?.status_pengajuan === 'pending' ? 'warning.main' : 'success.main'}>
                                            {loan?.status_pengajuan === 'pending' ? 'Sedang Diproses' : 'Selesai'}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* KETUA 2 - ASUMSI SETELAH KETUA 1 */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ 
                                        bgcolor: loan?.status_pengajuan === 'disetujui_ketua' ? '#FFF8E1' : (['pending_pengajuan', 'aktif', 'paid'].includes(loan?.status_pengajuan) ? '#DCFCE7' : '#F1F5F9'), 
                                        color: loan?.status_pengajuan === 'disetujui_ketua' ? '#F59E0B' : (['pending_pengajuan', 'aktif', 'paid'].includes(loan?.status_pengajuan) ? '#16A34A' : '#94A3B8'), 
                                        width: 32, height: 32 
                                    }}>
                                        {['pending_pengajuan', 'aktif', 'paid'].includes(loan?.status_pengajuan) ? <IconCircleCheck size="1rem" /> : (loan?.status_pengajuan === 'disetujui_ketua' ? <IconDots size="1rem" /> : <IconLock size="1rem" />)}
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={13} color={loan?.status_pengajuan === 'pending' ? 'text.disabled' : 'text.primary'}>Ketua 2</Typography>
                                        <Typography variant="caption" color={loan?.status_pengajuan === 'disetujui_ketua' ? 'warning.main' : (['pending_pengajuan', 'aktif', 'paid'].includes(loan?.status_pengajuan) ? 'success.main' : 'text.disabled')}>
                                            {loan?.status_pengajuan === 'pending' ? 'Menunggu' : (loan?.status_pengajuan === 'disetujui_ketua' ? 'Sedang Diproses' : 'Selesai')}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* PENCAIRAN DANA */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ 
                                        bgcolor: loan?.status_pengajuan === 'pending_pengajuan' ? '#FFF8E1' : (['aktif', 'paid'].includes(loan?.status_pengajuan) ? '#DCFCE7' : '#F1F5F9'), 
                                        color: loan?.status_pengajuan === 'pending_pengajuan' ? '#F59E0B' : (['aktif', 'paid'].includes(loan?.status_pengajuan) ? '#16A34A' : '#94A3B8'), 
                                        width: 32, height: 32 
                                    }}>
                                        {['aktif', 'paid'].includes(loan?.status_pengajuan) ? <IconCircleCheck size="1rem" /> : (loan?.status_pengajuan === 'pending_pengajuan' ? <IconDots size="1rem" /> : <IconLock size="1rem" />)}
                                    </Avatar>
                                    <Box>
                                        <Typography fontWeight={700} fontSize={13} color={['aktif', 'paid', 'pending_pengajuan'].includes(loan?.status_pengajuan) ? 'text.primary' : 'text.disabled'}>Pencairan Dana</Typography>
                                        <Typography variant="caption" color={loan?.status_pengajuan === 'pending_pengajuan' ? 'warning.main' : (['aktif', 'paid'].includes(loan?.status_pengajuan) ? 'success.main' : 'text.disabled')}>
                                            {['aktif', 'paid'].includes(loan?.status_pengajuan) ? 'Selesai' : (loan?.status_pengajuan === 'pending_pengajuan' ? 'Sedang Diproses' : 'Menunggu')}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            {/* REJECT DIALOG */}
            <Dialog
                open={openReject}
                onClose={handleCloseReject}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: '16px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Detail Penolakan</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>Silakan masukkan alasan penolakan pengajuan ini secara jelas.</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Alasan penolakan..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseReject} sx={{ fontWeight: 600 }}>Batal</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleSendReject}
                        sx={{ borderRadius: '8px', fontWeight: 700, px: 3 }}
                    >
                        Kirim Penolakan
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeadLoanDetailPage;
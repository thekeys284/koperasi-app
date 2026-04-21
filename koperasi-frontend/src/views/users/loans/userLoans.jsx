import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    CircularProgress,
    IconButton,
    Breadcrumbs,
    Link,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { IconLock } from "@tabler/icons-react";
import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";

const StatusBadge = ({ loan }) => {
    const statusPengajuan = loan?.status_pengajuan;
    const config = {
        aktif: {
            label: "Disetujui",
            bg: "#DCFCE7",
            color: "#16A34A",
        },
        approved: {
            label: "Disetujui Ketua",
            bg: "#DCFCE7",
            color: "#16A34A",
        },
        lunas: {
            label: "Lunas",
            bg: "#DBEAFE",
            color: "#2563EB",
        },
        rejected: {
            label: "Ditolak",
            bg: "#FEE2E2",
            color: "#DC2626",
        },
            review: {
                label: "Menunggu Konfirmasi",
                bg: "#E0F2FE",
                color: "#0284C7",
            },
        pending: {
            label: "Pending",
            bg: "#FEF3C7",
            color: "#F59E0B",
        },
        waiting_admin: {
            label: "Menunggu Admin",
            bg: "#FEF3C7",
            color: "#F59E0B",
        },
        waiting_lead: {
            label: "Menunggu Lead",
            bg: "#E0F2FE",
            color: "#0284C7",
        },
        postponement_review: {
            label: "Review Penundaan",
            bg: "#E0F2FE",
            color: "#0284C7",
        },
    };

    let item = config[loan?.status] || config.pending;
    if (statusPengajuan === "pending") item = config.waiting_admin;
    if (statusPengajuan === "pending_pengajuan") item = config.waiting_lead;
    if (statusPengajuan === "postpone") item = config.postponement_review;
    if (["disetujui_ketua", "aktif"].includes(statusPengajuan)) item = config.aktif;
    if (statusPengajuan === "paid") item = config.lunas;
    if (statusPengajuan === "rejected") item = config.rejected;

    return (
        <Chip
            label={item.label}
            sx={{
                background: item.bg,
                color: item.color,
                fontWeight: 600,
            }}
            size="small"
        />
    );
};

const PostponeDecisionNote = ({ loan }) => {
    if (!loan?.postpone_decision) return null;

    const isApproved = loan.postpone_decision === "approved";
    const label = isApproved ? "Penundaan Diterima" : "Penundaan Ditolak";
    const note = loan.postpone_decision_note || "Tidak ada catatan admin.";

    return (
        <Box sx={{ mt: 0.5, maxWidth: 200 }}>
            <Typography fontSize={11} color="#64748B" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography
                fontSize={11}
                color="#64748B"
                fontWeight={500}
                sx={{
                    lineHeight: 1.4,
                    fontStyle: "italic",
                }}
            >
                Catatan: {note}
            </Typography>
        </Box>
    );
};

const PostponeInstallmentRecord = ({ loan }) => {
    // Component for postponement display in table (optional helper)
    return <PostponeDecisionNote loan={loan} />;
};

const LoanTypeBadge = ({ type }) => {
    const config = {
        konsumtif: { bg: "#F3E8FF", color: "#9333EA" },
        produktif: { bg: "#DBEAFE", color: "#2563EB" },
    };

    const safeType = String(type || "konsumtif").toLowerCase();
    const badge = config[safeType] || config.konsumtif;

    return (
        <Chip
            label={safeType}
            size="small"
            sx={{
                background: badge.bg,
                color: badge.color,
                fontWeight: 600,
                textTransform: "uppercase",
            }}
        />
    );
};

const LoanModeBadge = ({ mode }) => {
    const normalized = String(mode || "new").toLowerCase();
    const isTopup = normalized === "topup";

    return (
        <Chip
            label={isTopup ? "TOP-UP" : "BARU"}
            size="small"
            sx={{
                background: isTopup ? "#FEE2E2" : "#E0F2FE",
                color: isTopup ? "#B91C1C" : "#075985",
                fontWeight: 700,
                textTransform: "uppercase",
            }}
        />
    );
};

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const RejectionNote = ({ loan }) => {
    const [expanded, setExpanded] = React.useState(false);
    if (loan?.status_pengajuan !== "rejected") return null;

    const note = loan.status_reason || "Tidak ada alasan penolakan yang dicantumkan.";
    const isLong = note.length > 50;
    const displayText = expanded || !isLong ? note : `${note.substring(0, 50)}...`;

    return (
        <Box 
            sx={{ 
                mt: 0.5, 
                maxWidth: 200, 
                cursor: isLong ? "pointer" : "default" 
            }}
            onClick={() => isLong && setExpanded(!expanded)}
        >
            <Typography 
                fontSize={11} 
                color="#64748B" 
                fontWeight={500}
                sx={{ 
                    lineHeight: 1.4,
                    fontStyle: "italic",
                    textDecoration: isLong && !expanded ? 'underline' : 'none',
                    textDecorationStyle: 'dotted'
                }}
            >
                Alasan: {displayText}
                {isLong && !expanded && (
                    <Typography component="span" fontSize={10} sx={{ ml: 0.5, fontWeight: 700 }}>
                        (Lihat)
                    </Typography>
                )}
            </Typography>
        </Box>
    );
};

const UserLoans = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [loans, setLoans] = React.useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [loanToDelete, setLoanToDelete] = React.useState(null);
    const [deleting, setDeleting] = React.useState(false);
    const [feedback, setFeedback] = React.useState({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await api.get("/loans", {
                params: {
                    user_id: 10,
                },
            });
            setLoans(response.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengambil data pinjaman user.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLoans();
    }, []);

    const handleDeleteClick = (id) => {
        setLoanToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await api.delete(`/loans/${loanToDelete}`, {
                params: { user_id: 10 }
            });
            await fetchLoans();
            setDeleteModalOpen(false);
            setFeedback({
                open: true,
                message: "Pengajuan berhasil dihapus.",
                severity: "success",
            });
        } catch (err) {
            setFeedback({
                open: true,
                message: err.response?.data?.message || "Gagal menghapus pengajuan.",
                severity: "error",
            });
        } finally {
            setDeleting(false);
            setLoanToDelete(null);
        }
    };

    const handleCloseFeedback = () => {
        setFeedback((prev) => ({ ...prev, open: false }));
    };

    // Scoreboard should reflect only currently active loans.
    const activeLoans = loans.filter((l) => ["disetujui_ketua", "aktif"].includes(l.status_pengajuan));

    const totalPokok = activeLoans.reduce((sum, loan) => sum + Number(loan.jumlah_pinjaman || 0), 0);

    const totalTerbayar = activeLoans.reduce((sum, loan) => {
        const loanCicilan = loan.cicilan || [];
        const paidAmount = loanCicilan
            .filter((item) => item.status_pembayaran === "paid")
            .reduce((s, item) => s + Number(item.nominal || 0), 0);
        return sum + paidAmount;
    }, 0);

    const sisaPinjaman = Math.max(0, totalPokok - totalTerbayar);
    const progress = totalPokok > 0 ? Math.round((totalTerbayar / totalPokok) * 100) : 0;
    
    const selectedLoan = loans.find(l => !["paid", "rejected"].includes(l.status_pengajuan)) || loans[0] || null;
    const hasActiveLoan = loans.some(loan => !["paid", "rejected"].includes(loan.status_pengajuan));
    const hasApprovedLoan = activeLoans.length > 0;

    return (
        <Box sx={{ p: 4, background: "#F5F7FB", minHeight: "100vh" }}>

            {/* BREADCRUMB */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1 }}
            >
                <Link underline="hover" color="text.primary">
                    Pinjaman
                </Link>
            </Breadcrumbs>

            {loading ? (
                <Stack direction="row" spacing={2} alignItems="center" mt={4} justifyContent="center" sx={{ minHeight: '60vh' }}>
                    <CircularProgress size={40} thickness={4} sx={{ color: '#2563EB' }} />
                    <Typography color="#1E293B" fontWeight={600} fontSize={18}>Memuat data pinjaman...</Typography>
                </Stack>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            ) : loans.length === 0 ? (
                /* EMPTY STATE */
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '70vh',
                        textAlign: 'center',
                        px: 2
                    }}
                >
                    <Box 
                        sx={{ 
                            width: 120, 
                            height: 120, 
                            borderRadius: '50%', 
                            background: '#EFF6FF', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 3,
                            border: '4px solid #DBEAFE'
                        }}
                    >
                        <AddIcon sx={{ fontSize: 60, color: '#2563EB' }} />
                    </Box>
                    <Typography variant="h3" fontWeight={800} color="#1E293B" mb={1}>
                        Belum Ada Pinjaman
                    </Typography>
                    <Typography color="#64748B" sx={{ maxWidth: 450, mb: 4, fontSize: 16 }}>
                        Anda belum memiliki riwayat pengajuan pinjaman. Mulai pengajuan baru Anda dengan menekan tombol di bawah ini.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/user/loans/add")}
                        sx={{
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 700,
                            px: 5,
                            py: 1.5,
                            fontSize: 16,
                            backgroundColor: "#2563EB",
                            boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
                            "&:hover": {
                                backgroundColor: "#1D4ED8",
                                boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.4)",
                            }
                        }}
                    >
                        Ajukan Pinjaman Baru
                    </Button>
                </Box>
            ) : (
                <>
                    {/* LABEL */}
                    <Chip
                        label={hasActiveLoan ? "Pinjaman Aktif" : "Tidak Ada Pinjaman Aktif"}
                        sx={{
                            background: hasActiveLoan ? "#DCFCE7" : "#F1F5F9",
                            color: hasActiveLoan ? "#16A34A" : "#64748B",
                            fontWeight: 700,
                            mb: 1,
                            px: 1
                        }}
                        size="small"
                    />

                    {/* HEADER */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={4}
                    >
                        <Typography variant="h4" fontWeight={800}>
                            ID Pinjam: {selectedLoan?.loan_number ? `#${selectedLoan.loan_number}` : "-"}
                        </Typography>

                    </Stack>

                    {/* STAT CARDS */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4} width="100%">
                        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                            <CardContent sx={{ p: '24px !important' }}>
                                <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                                    Total Pinjaman Pokok
                                </Typography>
                                <Typography fontSize={28} fontWeight={800} color="#1E293B">
                                    {formatCurrency(totalPokok)}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                            <CardContent sx={{ p: '24px !important' }}>
                                <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                                    Total Terbayar
                                </Typography>
                                <Typography fontSize={28} fontWeight={800} color="#16A34A">
                                    {formatCurrency(totalTerbayar)}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        mt: 1.5,
                                        borderRadius: 2,
                                        height: 8,
                                        backgroundColor: "#F1F5F9",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: "#16A34A",
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                            <CardContent sx={{ p: '24px !important' }}>
                                <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                                    Sisa Pinjaman
                                </Typography>
                                <Typography fontSize={28} fontWeight={800} color="#EF4444">
                                    {formatCurrency(sisaPinjaman)}
                                </Typography>
                                {/* <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block", mt: 1 }}>
                                    {sisaCicilan} cicilan tersisa
                                </Typography> */}
                            </CardContent>
                        </Card>
                    </Stack>

                    {/* TABLE */}
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none", overflow: 'hidden' }}>
                        <CardContent sx={{ pb: '0 !important', pt: '20px !important' }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                                px={1}
                            >
                                <Typography variant="h5" fontWeight={800} color="#1E293B">
                                    Daftar Pengajuan Pinjaman
                                </Typography>

                                <Button
                                    startIcon={<AddIcon />}
                                    variant="contained"
                                    onClick={() => navigate(hasApprovedLoan ? "/user/loans/topup" : "/user/loans/add")}
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 3,
                                        py: 1,
                                        backgroundColor: "#2563EB",
                                        "&:hover": {
                                            backgroundColor: "#1D4ED8",
                                        }
                                    }}
                                >
                                    {hasApprovedLoan ? "Top Up" : "Pengajuan Baru +"}
                                </Button>
                            </Stack>

                            <Box sx={{ mx: -2 }}>
                                <Table
                                    sx={{
                                        minWidth: 600,
                                        "& .MuiTableBody-root .MuiTableRow-root": {
                                            transition: "background-color 0.2s",
                                        },
                                        "& .MuiTableBody-root .MuiTableRow-root:hover": {
                                            backgroundColor: "#F8FAFC",
                                        },
                                        "& .MuiTableCell-root": {
                                            borderBottom: "1px solid #F1F5F9",
                                            py: 2.5,
                                            px: 3,
                                        },
                                    }}
                                >
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                backgroundColor: "#F8FAFC",
                                                "& .MuiTableCell-head": {
                                                    fontWeight: 700,
                                                    fontSize: "12px",
                                                    color: "#64748B",
                                                    letterSpacing: "0.5px",
                                                    textTransform: "uppercase",
                                                    borderBottom: "2px solid #E2E8F0",
                                                }
                                            }}
                                        >
                                            <TableCell>ID & TGL PENGAJUAN</TableCell>
                                            <TableCell>JENIS & JUMLAH</TableCell>
                                            <TableCell>TENOR</TableCell>
                                            <TableCell>STATUS</TableCell>
                                            <TableCell>PERSETUJUAN</TableCell>
                                            <TableCell align="center">DETAIL</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {loans.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell>
                                                    <Typography fontWeight={700} color="#2563EB">
                                                        #{loan.loan_number}
                                                    </Typography>
                                                    <Typography fontSize={12} color="#64748B">
                                                        {formatDate(loan.created_at)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                                                        <LoanTypeBadge type={loan.type_slug} />
                                                        <LoanModeBadge mode={loan.loan_mode} />
                                                    </Stack>
                                                    <Typography fontWeight={800} sx={{ mt: 0.5 }}>
                                                        {formatCurrency(loan.jumlah_pinjaman)}
                                                    </Typography>
                                                    {loan.referred_loan?.loan_number && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Ref: #{loan.referred_loan.loan_number}
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                                    {loan.lama_pembayaran} Bulan
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge loan={loan} />
                                                    <PostponeDecisionNote loan={loan} />
                                                    <RejectionNote loan={loan} />
                                                </TableCell>

                                                <TableCell>
                                                    <Stack spacing={0.4}>
                                                        <Typography fontSize={12} color="#334155" fontWeight={700}>
                                                            ACC Admin: {loan.status_pengajuan === "rejected" && !loan.tgl_acc_admin ? (
                                                                <Typography component="span" fontSize={11} color="error.main" fontWeight={800}>DITOLAK ADMIN</Typography>
                                                            ) : formatDate(loan.tgl_acc_admin || loan.tgl_acc_ketua1)}
                                                        </Typography>
                                                        <Typography fontSize={12} color="#334155" fontWeight={700}>
                                                            ACC Ketua: {loan.status_pengajuan === "rejected" && loan.tgl_acc_admin && !loan.tgl_acc_ketua ? (
                                                                <Typography component="span" fontSize={11} color="error.main" fontWeight={800}>DITOLAK KETUA</Typography>
                                                            ) : formatDate(loan.tgl_acc_ketua || loan.tgl_acc_ketua2)}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <IconButton 
                                                            onClick={() => navigate(`/user/loans/cicilan?loan_id=${loan.id}&user_id=10`)}
                                                            size="small"
                                                            disabled={loan.status_pengajuan === "rejected"}
                                                            sx={{ 
                                                                color: '#94A3B8', 
                                                                '&:hover': { color: '#2563EB', background: '#EFF6FF' },
                                                                '&.Mui-disabled': { color: '#E2E8F0' }
                                                            }}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                        
                                                        {loan.status_pengajuan === "pending" && (
                                                            <IconButton 
                                                                onClick={() => handleDeleteClick(loan.id)}
                                                                size="small"
                                                                sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', background: '#FEF2F2' } }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog 
                open={deleteModalOpen} 
                onClose={() => !deleting && setDeleteModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: '16px', p: 1, maxWidth: '400px' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1 }}>
                    Hapus Pengajuan?
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Apakah Anda yakin ingin menghapus pengajuan pinjaman ini? Tindakan ini tidak dapat dibatalkan.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setDeleteModalOpen(false)} 
                        disabled={deleting}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        sx={{ 
                            borderRadius: '10px', 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            px: 3,
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                        }}
                    >
                        {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                    </Button>
                </DialogActions>
            </Dialog>

            <LoanFeedbackSnackbar
                open={feedback.open}
                message={feedback.message}
                severity={feedback.severity}
                onClose={handleCloseFeedback}
            />
        </Box>
    );
};

export default UserLoans;
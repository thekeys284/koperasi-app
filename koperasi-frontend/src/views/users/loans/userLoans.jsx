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
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { IconLock } from "@tabler/icons-react";

const StatusBadge = ({ status }) => {
    const config = {
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
        pending: {
            label: "Pending",
            bg: "#FEF3C7",
            color: "#F59E0B",
        },
    };

    const item = config[status] || config.pending;

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

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const UserLoans = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [loans, setLoans] = React.useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [loanToDelete, setLoanToDelete] = React.useState(null);
    const [deleting, setDeleting] = React.useState(false);

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
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus pengajuan.");
        } finally {
            setDeleting(false);
            setLoanToDelete(null);
        }
    };

    const selectedLoan = loans[0] || null;
    const selectedLoanCicilan = selectedLoan?.cicilan || [];
    const totalPokok = selectedLoan ? Number(selectedLoan.jumlah_pinjaman || 0) : 0;
    const totalTerbayar = selectedLoanCicilan
        .filter((item) => item.status_pembayaran === "paid")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
    const sisaPinjaman = Math.max(0, totalPokok - totalTerbayar);
    const progress = totalPokok > 0 ? Math.round((totalTerbayar / totalPokok) * 100) : 0;
    const sisaCicilan = selectedLoanCicilan.filter((item) => item.status_pembayaran !== "paid").length;
    const hasActiveLoan = loans.some(loan => !["lunas", "rejected"].includes(loan.status));

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
                        label="Pinjaman Aktif"
                        sx={{
                            background: "#DCFCE7",
                            color: "#16A34A",
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

                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                                py: 0.8,
                                backgroundColor: "#2563EB",
                                boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
                                "&:hover": {
                                    backgroundColor: "#1D4ED8",
                                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.23)",
                                }
                            }}
                        >
                            Cetak Rekap
                        </Button>
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
                                <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block", mt: 1 }}>
                                    {sisaCicilan} cicilan tersisa
                                </Typography>
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
                                    startIcon={hasActiveLoan ? <IconLock size={18} /> : <AddIcon />}
                                    variant="contained"
                                    disabled={hasActiveLoan}
                                    onClick={() => navigate("/user/loans/add")}
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        px: 3,
                                        py: 1,
                                        backgroundColor: hasActiveLoan ? "#94A3B8" : "#2563EB",
                                        "&:hover": {
                                            backgroundColor: hasActiveLoan ? "#94A3B8" : "#1D4ED8",
                                        },
                                        "&.Mui-disabled": {
                                            backgroundColor: "#E2E8F0",
                                            color: "#94A3B8"
                                        }
                                    }}
                                >
                                    {hasActiveLoan ? "Pinjaman Aktif" : "Pengajuan Baru"}
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
                                            <TableCell>ACC KETUA</TableCell>
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
                                                    <LoanTypeBadge type={loan.type_slug} />
                                                    <Typography fontWeight={800} sx={{ mt: 0.5 }}>
                                                        {formatCurrency(loan.jumlah_pinjaman)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                                    {loan.lama_pembayaran} Bulan
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge status={loan.status} />
                                                </TableCell>

                                                <TableCell>
                                                    <Typography fontSize={13} fontWeight={500} color="#475569">
                                                        {formatDate(loan.tgl_acc_ketua1)}
                                                    </Typography>
                                                    <Typography fontSize={11} color="#94A3B8">
                                                        Terakhir diperbarui
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={0.5} justifyContent="center">
                                                        <IconButton 
                                                            onClick={() => navigate(`/user/loans/cicilan?loan_id=${loan.id}&user_id=10`)}
                                                            size="small"
                                                            sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', background: '#EFF6FF' } }}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                        
                                                        {!loan.tgl_acc_ketua1 && (
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
        </Box>
    );
};

export default UserLoans;
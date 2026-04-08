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
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";

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

    React.useEffect(() => {
        const fetchLoans = async () => {
            try {
                setLoading(true);
                const response = await api.get("/loans", {
                    params: {
                        user_id: 1,
                    },
                });
                setLoans(response.data?.data || []);
            } catch (err) {
                setError(err.response?.data?.message || "Gagal mengambil data pinjaman user.");
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);

    const selectedLoan = loans[0] || null;
    const selectedLoanCicilan = selectedLoan?.cicilan || [];
    const totalPokok = selectedLoan ? Number(selectedLoan.jumlah_pinjaman || 0) : 0;
    const totalTerbayar = selectedLoanCicilan
        .filter((item) => item.status_pembayaran === "paid")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
    const sisaPinjaman = Math.max(0, totalPokok - totalTerbayar);
    const progress = totalPokok > 0 ? Math.round((totalTerbayar / totalPokok) * 100) : 0;
    const sisaCicilan = selectedLoanCicilan.filter((item) => item.status_pembayaran !== "paid").length;

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


            {/* LABEL */}
            <Chip
                label="Pinjaman Aktif"
                sx={{
                    background: "#DBEAFE",
                    color: "#2563EB",
                    fontWeight: 600,
                    mb: 1,
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
                    <CardContent>
                        <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                            Total Pinjaman Pokok
                        </Typography>
                        <Typography fontSize={28} fontWeight={800} color="#2563EB">
                            {formatCurrency(totalPokok)}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
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
                                height: 6,
                                backgroundColor: "#E5E7EB",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#16A34A",
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
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

            {loading && (
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <CircularProgress size={20} />
                    <Typography color="text.secondary">Memuat data pinjaman user...</Typography>
                </Stack>
            )}

            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* TABLE */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography fontWeight={700}>
                            Daftar Pengajuan
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            {/* <Button
                                startIcon={<FilterListIcon />}
                                variant="outlined"
                            >
                                Filter
                            </Button> */}

                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={() => navigate("/user/loans/add")}
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
                                Pengajuan Baru
                            </Button>
                        </Stack>
                    </Stack>

                    <Box sx={{ overflowX: "auto" }}>
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
                                    py: 2,
                                    px: 2,
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
                                            color: "#475569",
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
                                    <TableCell>DETAIL</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell>
                                            <Typography fontWeight={700} color="primary">
                                                #{loan.loan_number}
                                            </Typography>
                                            <Typography fontSize={12} color="text.secondary">
                                                {formatDate(loan.created_at)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <LoanTypeBadge type={loan.type_slug} />
                                            <Typography fontWeight={700}>
                                                {formatCurrency(loan.jumlah_pinjaman)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>{loan.lama_pembayaran} Bulan</TableCell>

                                        <TableCell>
                                            <StatusBadge status={loan.status} />
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontSize={12}>
                                                {formatDate(loan.tgl_acc_ketua1)} / {formatDate(loan.tgl_acc_ketua2)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <IconButton onClick={() => navigate(`/user/loans/cicilan?loan_id=${loan.id}&user_id=1`)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && loans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Belum ada data pengajuan pinjaman.
                                        </TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </Box>

                </CardContent>
            </Card>

        </Box>
    );
};

export default UserLoans;
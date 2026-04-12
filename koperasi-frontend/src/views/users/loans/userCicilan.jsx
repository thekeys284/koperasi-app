import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    LinearProgress,
    Breadcrumbs,
    Link,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import PostponeInstallmentModal from "../../../ui-component/cards/Loans/User/userTundaCicilan";
import api from "../../../api/axios";

const StatusChip = ({ status }) => {
    const config = {
        paid: {
            label: "Sudah Bayar",
            sx: { bgcolor: "success.main", color: "#fff", fontWeight: 600 }
        },
        unpaid: {
            label: "Belum Bayar",
            sx: { bgcolor: "warning.main", color: "#fff", fontWeight: 600 }
        },
        locked: {
            label: "Terkunci",
            sx: { bgcolor: "#E2E8F0", color: "#64748B", fontWeight: 600 }
        },
        postponed: {
            label: "Ditunda",
            sx: { bgcolor: "info.main", color: "#fff", fontWeight: 600 }
        },
    };

    const item = config[status] || config.unpaid;

    return (
        <Chip
            label={item.label}
            size="small"
            sx={item.sx}
        />
    );
};

const UserCicilan = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [postponeModalOpen, setPostponeModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loan, setLoan] = useState(null);

    const loanId = searchParams.get("loan_id");
    const userId = searchParams.get("user_id") || "5";

    const fetchLoanDetail = async () => {
        try {
            setLoading(true);

            let targetLoanId = loanId;
            if (!targetLoanId) {
                const listResponse = await api.get("/loans", {
                    params: { user_id: userId },
                });
                const firstLoan = listResponse.data?.data?.[0];
                targetLoanId = firstLoan?.id;
            }

            if (!targetLoanId) {
                setLoan(null);
                return;
            }

            const detailResponse = await api.get(`/loans/${targetLoanId}`, {
                params: { user_id: userId },
            });
            setLoan(detailResponse.data?.data || null);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengambil detail cicilan.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLoanDetail();
    }, [loanId, userId]);

    const cicilanList = loan?.cicilan || [];
    const totalPokok = Number(loan?.jumlah_pinjaman || 0);
    const totalTerbayar = cicilanList
        .filter((item) => item.status_pembayaran === "paid")
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
    const sisaPinjaman = Math.max(0, totalPokok - totalTerbayar);
    const progress = totalPokok > 0 ? Math.round((totalTerbayar / totalPokok) * 100) : 0;
    const sisaCicilan = cicilanList.filter((item) => item.status_pembayaran !== "paid").length;

    const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;
    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    };
    const mapCicilanStatus = (status) => {
        if (status === "paid") return "paid";
        if (status === "postponed") return "postponed";
        return "unpaid";
    };

    return (
        <Box sx={{ p: 4, background: "#F5F7FB", minHeight: "100vh" }}>

            {/* BREADCRUMB */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1 }}
            >
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate("/user/loans")}
                    sx={{ cursor: "pointer" }}
                >
                    Pinjaman
                </Link>
                <Typography color="text.primary">Pinjaman Detail</Typography>
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
                mb={3}
            >
                <Typography variant="h4" fontWeight={800}>
                    ID Pinjam: {loan?.loan_number ? `#${loan.loan_number}` : "-"}
                </Typography>
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
                    <Typography color="text.secondary">Memuat detail cicilan...</Typography>
                </Stack>
            )}

            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* INFORMASI PINJAMAN */}
            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none", mb: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 2, px: 3 }}
                >
                    <Typography fontWeight={700} color="#1E293B">Informasi Pinjaman</Typography>

                    <Chip
                        label={String(loan?.type || "Konsumtif").toUpperCase()}
                        size="small"
                        sx={{
                            background: "#F3E8FF",
                            color: "#9333EA",
                            fontWeight: 700,
                        }}
                    />
                </Stack>

                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                                Jenis Pinjaman
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                                {loan?.type || "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Jumlah Pinjaman
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {formatCurrency(loan?.jumlah_pinjaman)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tenor
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {loan?.lama_pembayaran || "-"} Bulan
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tgl Potong
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {loan?.bulan_potong_gaji || formatDate(loan?.tanggal_mulai_cicilan)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tgl Pengajuan
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {formatDate(loan?.created_at)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>

            {/* JADWAL CICILAN */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography fontWeight={700}>
                            Jadwal Pembayaran Cicilan
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setPostponeModalOpen(true)}
                            disabled={[
                                "pending",
                                "pending_pengajuan",
                                "postpone",
                            ].includes(loan?.status_pengajuan) || sisaCicilan === 0}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Ajukan Tunda Cicilan
                        </Button>
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
                                        },
                                    }}
                                >
                                    <TableCell>ID CICILAN</TableCell>
                                    <TableCell>CICILAN KE-</TableCell>
                                    <TableCell>TANGGAL JATUH TEMPO</TableCell>
                                    <TableCell>NOMINAL</TableCell>
                                    <TableCell>STATUS</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cicilanList.map((item) => (
                                    <TableRow key={item.id} sx={item.status_pembayaran !== "paid" ? { background: "#F9FAFB" } : undefined}>
                                        <TableCell>#{`CIC-${String(item.id).padStart(4, "0")}`}</TableCell>
                                        <TableCell>{item.cicilan}</TableCell>
                                        <TableCell>{formatDate(item.tanggal_pembayaran)}</TableCell>
                                        <TableCell>{formatCurrency(item.nominal)}</TableCell>
                                        <TableCell>
                                            <StatusChip status={mapCicilanStatus(item.status_pembayaran)} />
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && cicilanList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Belum ada jadwal cicilan untuk pinjaman ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>

                </CardContent>
            </Card>

            <PostponeInstallmentModal
                open={postponeModalOpen}
                handleClose={() => setPostponeModalOpen(false)}
                data={{
                    loanId: loan?.id,
                    loanNumber: loan?.loan_number,
                    installments: cicilanList
                }}
                onSuccess={fetchLoanDetail}
            />
        </Box>
    );
};

export default UserCicilan;
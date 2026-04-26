import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../../utils/format";
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconArrowUpCircle } from "@tabler/icons-react";

import PostponeInstallmentModal from "../../../ui-component/cards/Loans/User/userTundaCicilan";
import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";
import TopupInfoCard from "../../../ui-component/cards/Loans/Pjtoko/TopupInfoCard";
import LoanProofModal from "../../../ui-component/cards/Loans/LoanProofModal";
import api from "../../../api/axios";
import { InstallmentStatusBadge, LoanStatusBadge, LoanTypeBadge } from "../../../ui-component/cards/Loans/LoanBadges";
const UserCicilan = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [postponeModalOpen, setPostponeModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loan, setLoan] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [feedback, setFeedback] = useState({
        open: false,
        message: "",
        severity: "success",
    });

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
    const nominalPerBulan = Number(loan?.nominal_per_bulan) || 0;


    const mapCicilanStatus = (item) => {
        if (item.status_pembayaran === "paid") return "paid";
        if (item.status_pembayaran === "postponed") return "postponed";

        // Cek jika sedang dalam proses pengajuan penundaan
        if (loan?.status_pengajuan === "postpone" && Number(loan?.postpone_cicilan_id) === Number(item.id)) {
            return "waiting_postpone";
        }

        return "unpaid";
    };

    const showFeedback = (severity, message) => {
        setFeedback({ open: true, severity, message });
    };

    const handleCloseFeedback = () => {
        setFeedback((prev) => ({ ...prev, open: false }));
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
            <Box mb={1}>
                <LoanStatusBadge status={loan?.status_pengajuan} showReason={false} />
            </Box>

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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} width="100%" sx={{ mb: 3 }}>
                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
                        <Typography fontSize={14} fontWeight={600} color="#64748B" mb={1}>
                            Total Pinjaman Pokok
                        </Typography>
                        <Typography fontSize={24} fontWeight={800} color="#2563EB">
                            {formatCurrency(totalPokok)}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
                        <Typography fontSize={14} fontWeight={600} color="#64748B" mb={1}>
                            Total Terbayar
                        </Typography>
                        <Typography fontSize={24} fontWeight={800} color="#16A34A">
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
                        <Typography fontSize={14} fontWeight={600} color="#64748B" mb={1}>
                            Sisa Pinjaman
                        </Typography>
                        <Typography fontSize={24} fontWeight={800} color="#EF4444">
                            {formatCurrency(sisaPinjaman)}
                        </Typography>
                        <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block", mt: 1 }}>
                            {sisaCicilan} cicilan tersisa
                        </Typography>
                        <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block" }}>
                            cicilan: {formatCurrency(nominalPerBulan)} / bulan
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {loan?.loan_mode === 'topup' && (
                <Accordion
                    sx={{
                        mb: 3,
                        borderRadius: "12px !important",
                        boxShadow: "none",
                        border: "1px solid #E5E7EB",
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 3, py: 1 }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#2563EB',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <IconArrowUpCircle size="1.1rem" />
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="#1E293B">Informasi Detail Top-Up</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <TopupInfoCard referredLoan={loan.referred_loan} totalAmount={loan.jumlah_pinjaman} isInsideAccordion />
                    </AccordionDetails>
                </Accordion>
            )}

            {/* INFORMASI PINJAMAN */}
            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none", mb: 3 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ p: 2, px: 3 }}
                >
                    <Typography fontWeight={700} color="#1E293B">Informasi Pinjaman</Typography>

                    <LoanTypeBadge type={loan?.type_slug} />
                </Stack>

                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                                Jenis Pinjaman
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                                {loan?.type_slug || "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Jumlah Pinjaman
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {formatCurrency(loan?.jumlah_pinjaman)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tenor
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {loan?.lama_pembayaran || "-"} Bulan
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tgl Potong
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {formatDate(loan?.tanggal_mulai_cicilan)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                Tgl Pengajuan
                            </TableCell>
                            <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                {formatDate(loan?.created_at)}
                            </TableCell>
                        </TableRow>

                        {loan?.document_url && (
                            <TableRow>
                                <TableCell sx={{ width: "40%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                                    Bukti Nota
                                </TableCell>
                                <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                                    <Box
                                        component="img"
                                        src={loan.document_url}
                                        alt="Bukti Nota"
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "12px",
                                            objectFit: "cover",
                                            border: "1px solid #E2E8F0",
                                            cursor: "pointer",
                                            display: "block",
                                            "&:hover": { opacity: 0.8 }
                                        }}
                                        onClick={() => setPreviewOpen(true)}
                                    />
                                    <Typography
                                        variant="caption"
                                        color="primary"
                                        sx={{ cursor: "pointer", mt: 0.5, display: "block", fontWeight: 600 }}
                                        onClick={() => setPreviewOpen(true)}
                                    >
                                        Klik untuk memperbesar
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* JADWAL CICILAN */}
            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none", mb: 3 }}>
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
                            variant="contained"
                            size="small"
                            onClick={() => setPostponeModalOpen(true)}
                            disabled={[
                                "pending",
                                "pending_pengajuan",
                                "postpone",
                                "paid",
                                "rejected",
                            ].includes(loan?.status_pengajuan) || sisaCicilan === 0}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "#2563EB",
                                color: "#ffffff",
                                boxShadow: "none",
                                "&:hover": {
                                    bgcolor: "#1D4ED8",
                                    boxShadow: "none"
                                },
                                "&.Mui-disabled": {
                                    bgcolor: "#F1F5F9",
                                    color: "#94A3B8"
                                }
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
                                            <Stack spacing={0.5} alignItems="flex-start">
                                                <InstallmentStatusBadge status={mapCicilanStatus(item)} />
                                                {item.status_pembayaran === "postponed" && (
                                                    <Box sx={{ mt: 0.5, maxWidth: 180 }}>
                                                        <Typography fontSize={11} color="info.main" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                                            Penundaan Diterima
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
                                                            Catatan: {item.pjtoko_note || "Tidak ada catatan admin."}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {loan?.status_pengajuan === "postpone" && Number(loan?.postpone_cicilan_id) === Number(item.id) && (
                                                    <Box sx={{ mt: 0.5, maxWidth: 180 }}>
                                                        <Typography fontSize={11} color="warning.main" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                                            Menunggu Konfirmasi
                                                        </Typography>
                                                        <Typography
                                                            fontSize={10}
                                                            color="#64748B"
                                                            sx={{ fontStyle: "italic" }}
                                                        >
                                                            Alasan: {item.postponement_reason}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Stack>
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
                onNotify={showFeedback}
            />

            <LoanFeedbackSnackbar
                open={feedback.open}
                message={feedback.message}
                severity={feedback.severity}
                onClose={handleCloseFeedback}
            />

            <LoanProofModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                imageUrl={loan?.document_url}
                title="Preview Bukti Nota"
            />
        </Box>
    );
};

export default UserCicilan;

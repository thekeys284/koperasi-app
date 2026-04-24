import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../../utils/format";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Breadcrumbs,
  Link,
  LinearProgress,
  CircularProgress,
  Alert,
  Checkbox,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IconArrowUpCircle } from "@tabler/icons-react";


import PostponeInstallmentModal from "../../../ui-component/cards/Loans/Pjtoko/PostponeInstallmentModal";
import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";
import TopupInfoCard from "../../../ui-component/cards/Loans/Pjtoko/TopupInfoCard";
import api from "../../../api/axios";

export default function LoanDetails() {
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingInstallmentIds, setUpdatingInstallmentIds] = useState([]);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loan, setLoan] = useState(null);

  const currentDate = new Date();

  const parseDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isSameMonth = (value) => {
    const date = parseDate(value);
    return (
      date &&
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth()
    );
  };

  const addMonth = (value) => {
    const date = parseDate(value);
    if (!date) return null;
    const next = new Date(date);
    const currentDay = next.getDate();
    next.setMonth(next.getMonth() + 1);
    if (next.getDate() !== currentDay) {
      next.setDate(0);
    }
    return next;
  };

  const showFeedback = (severity, message) => {
    setFeedback({ open: true, severity, message });
  };

  const handleDirectConfirm = async (installment, isPaid) => {
    if (!installment || !loan?.id) return;

    setError("");
    const nextStatus = isPaid ? "paid" : "pending";
    const nextTukinStatus = isPaid ? "sudah" : "belum";
    const previousStatus = installment.status_pembayaran;
    const previousTukinStatus = installment.tukin_status;

    setUpdatingInstallmentIds((prev) =>
      prev.includes(installment.id) ? prev : [...prev, installment.id]
    );

    setLoan((prevLoan) => {
      if (!prevLoan) return prevLoan;

      return {
        ...prevLoan,
        cicilan: (prevLoan.cicilan || []).map((item) =>
          item.id === installment.id
            ? {
                ...item,
                status_pembayaran: nextStatus,
                tukin_status: nextTukinStatus,
              }
            : item
        ),
      };
    });

    try {
      await api.patch(`/loans/${loan.id}/cicilan/${installment.id}`, {
        tukin_status: isPaid ? "sudah" : "pending",
        note: "",
      });

      // Keep UI responsive; sync detail in background without blocking checkbox state.
      fetchLoanDetail(false);
      showFeedback("success", isPaid ? "Pembayaran berhasil dikonfirmasi" : "Status pembayaran berhasil direset");
    } catch (err) {
      setLoan((prevLoan) => {
        if (!prevLoan) return prevLoan;

        return {
          ...prevLoan,
          cicilan: (prevLoan.cicilan || []).map((item) =>
            item.id === installment.id
              ? {
                  ...item,
                  status_pembayaran: previousStatus,
                  tukin_status: previousTukinStatus,
                }
              : item
          ),
        };
      });
      showFeedback("error", err.response?.data?.message || "Gagal mengubah status cicilan.");
    } finally {
      setUpdatingInstallmentIds((prev) => prev.filter((id) => id !== installment.id));
    }
  };

  const fetchLoanDetail = async (withLoading = true) => {
    try {
      if (withLoading) {
        setLoading(true);
      }

      let targetLoanId = loanId;
      if (!targetLoanId) {
        const listResponse = await api.get("/loans", {
          params: {
            all: isAdmin ? 1 : undefined,
            user_id: userId,
          },
        });
        targetLoanId = listResponse.data?.data?.[0]?.id;
      }

      if (!targetLoanId) {
        setLoan(null);
        return;
      }

      const detailResponse = await api.get(`/loans/${targetLoanId}`, {
        params: {
          all: isAdmin ? 1 : undefined,
          user_id: userId,
        },
      });
      setLoan(detailResponse.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil detail pinjaman.");
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  };

  const isAdmin = location.pathname.includes("/admin");
  const basePath = isAdmin ? "/pjtoko/loans/daftar" : "/user/loans";
  const loanId = searchParams.get("loan_id");
  const userId = searchParams.get("user_id") || "1";

  React.useEffect(() => {
    fetchLoanDetail();
  }, [loanId, userId, isAdmin]);

  const cicilanList = loan?.cicilan || [];
  const totalPokok = Number(loan?.jumlah_pinjaman || 0);
  const totalTerbayar = cicilanList
    .filter((item) => item.tukin_status === "sudah")
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
  const sisaPinjaman = Math.max(0, totalPokok - totalTerbayar);
  const progress = totalPokok > 0 ? Math.round((totalTerbayar / totalPokok) * 100) : 0;
  const sisaCicilan = cicilanList.filter((item) => item.status_pembayaran === "pending").length;
  const nominalPerBulan = cicilanList[0]?.nominal || 0;

  const getStatusStyle = (item) => {
    // 1. Sudah Bayar
    if (item.status_pembayaran === "postponed") {
      return {
        label: "Ditunda",
        sx: { bgcolor: "#FEF3C7", color: "#e5a143ff", fontWeight: 600 }
      };
    }
    if (item.status_pembayaran === "paid") {
      return {
        label: "Lunas",
        sx: { bgcolor: "#DBEAFE", color: "#2563EB", fontWeight: 600 }
      };
    }

    // 3. Menunggu Review (Jika status pengajuan pinjaman sedang postpone)
    if (loan?.status_pengajuan === "postpone") {
      return {
        label: "Menunggu Review",
        sx: { bgcolor: "primary.main", color: "#fff", fontWeight: 600 }
      };
    }

    // 4. Belum Bayar (Default)
    return {
      label: "Belum Bayar",
      sx: { bgcolor: "warning.main", color: "#fff", fontWeight: 600 }
    };
  };

  const isPendingReviewInstallment = (item) => {
    if (loan?.status_pengajuan !== "postpone") return false;
    if (!item?.id) return false;

    const isMarkedPostponed =
      item.status_pembayaran === "postponed";

    if (isMarkedPostponed) return true;
    if (!loan?.postpone_cicilan_id) return false;

    return Number(item.id) === Number(loan.postpone_cicilan_id);
  };

  const openPostponeModal = (installment) => {
    setSelectedInstallment({
      ...installment,
      loan_number: loan?.loan_number,
      reason: loan?.reason,
      pjtoko_note: loan?.pjtoko_note
    });
    setPostponeModalOpen(true);
  };

  const closePostponeModal = () => {
    setSelectedInstallment(null);
    setPostponeModalOpen(false);
  };

  const handleApprovePostpone = async ({ note }) => {
    if (!selectedInstallment || !loan?.id) return;

    setSaving(true);
    setError("");
    try {
      await api.patch(`/loans/${loan.id}/cicilan/${selectedInstallment.id}`, {
        tukin_status: "postponed",
        status_pembayaran: "postponed",
        pjtoko_note: note,
      });
      await fetchLoanDetail();
      setFeedback({
        open: true,
        severity: "success",
        message: "Penundaan cicilan berhasil disetujui.",
      });
      closePostponeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyetujui penundaan.");
      setFeedback({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Gagal menyetujui penundaan.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPostpone = async ({ note }) => {
    if (!selectedInstallment || !loan?.id) return;

    setSaving(true);
    setError("");
    try {
      // Rejecting postponement: set status back to 'belum' so it can be paid normally
      await api.patch(`/loans/${loan.id}/cicilan/${selectedInstallment.id}`, {
        tukin_status: "pending",
        status_pembayaran: "pending",
        pjtoko_note: note,
      });
      await fetchLoanDetail();
      setFeedback({
        open: true,
        severity: "success",
        message: "Penundaan cicilan berhasil ditolak.",
      });
      closePostponeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menolak penundaan.");
      setFeedback({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Gagal menolak penundaan.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
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
          onClick={() => navigate(basePath)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pinjaman
        </Link>
        <Typography color="text.primary">Detail Pinjaman</Typography>
      </Breadcrumbs>

      {/* LABEL */}
      {/* LABEL */}
      <Chip
        label={loan?.status_pengajuan === "paid" ? "Pinjaman Lunas" : "Pinjaman Aktif"}
        sx={{
          background: loan?.status_pengajuan === "paid" ? "#DBEAFE" : "#DCFCE7",
          color: loan?.status_pengajuan === "paid" ? "#2563EB" : "#16A34A",
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
        mt={1}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            ID Pinjam: {loan?.loan_number ? `#${loan.loan_number}` : "-"}
          </Typography>
        </Box>
      </Stack>

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">Memuat detail pinjaman...</Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* STAT CARDS */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={4} width="100%">
        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
          <CardContent>
            <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
              Total Pinjaman Pokok
            </Typography>
            <Typography fontSize={28} fontWeight={800} color="#16A34A">
              {formatCurrency(totalPokok)}
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
            <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block" }}>
              cicilan: {formatCurrency(nominalPerBulan)} / bulan
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* INFORMASI TOP-UP (Jika Top-Up) */}
      {loan?.loan_mode === 'topup' && (
        <Accordion 
          sx={{ 
            mt: 4,
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
            <TopupInfoCard 
              referredLoan={loan.referred_loan} 
              currentAmount={loan.amount_requested || loan.jumlah_pinjaman} 
              isInsideAccordion 
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* INFORMASI PINJAMAN */}
      <Card sx={{ mt: 4, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
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
                Mode Pengajuan
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                <Chip
                  label={String(loan?.loan_mode_label || (loan?.loan_mode === 'topup' ? "Top-Up" : "Baru")).toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: loan?.loan_mode === "topup" ? "#FEE2E2" : "#DBEAFE",
                    color: loan?.loan_mode === "topup" ? "#B91C1C" : "#1D4ED8",
                    fontWeight: 700,
                    px: 1,
                    height: 24
                  }}
                />
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
                {formatDate(loan?.tanggal_mulai_cicilan)}
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
            {loan?.document_url ? (
              <TableRow>
                <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                  Bukti Nota
                </TableCell>
                <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                  <Box 
                    component="img" 
                    src={loan.document_url} 
                    alt="Bukti Nota"
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      objectFit: 'cover', 
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '1px solid #E5E7EB',
                      '&:hover': { opacity: 0.8 }
                    }} 
                    onClick={() => window.open(loan.document_url, '_blank')}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.main', cursor: 'pointer' }} onClick={() => window.open(loan.document_url, '_blank')}>
                    Klik untuk memperbesar
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
                loan?.type?.toLowerCase() === 'konsumtif' && (
                  <TableRow>
                    <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                      Bukti Nota
                    </TableCell>
                    <TableCell sx={{ color: "#EF4444", fontWeight: 700, borderBottom: "none", px: 3, py: 1.5 }}>
                      Belum diunggah
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </Card>

      {/* JADWAL CICILAN */}
      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Jadwal Pembayaran Cicilan
          </Typography>

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
                  <TableCell>CICILAN KE</TableCell>
                  <TableCell>TANGGAL JATUH TEMPO</TableCell>
                  <TableCell>NOMINAL</TableCell>
                  <TableCell>STATUS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cicilanList.map((item) => {
                  const style = getStatusStyle(item);
                  return (
                    <TableRow key={item.id} sx={item.tukin_status !== "sudah" ? { background: "#eef2ff" } : undefined}>
                      <TableCell>#{`CIC-${String(item.id).padStart(4, "0")}`}</TableCell>
                      <TableCell>{item.cicilan}</TableCell>
                      <TableCell>{formatDate(item.tanggal_pembayaran)}</TableCell>
                      <TableCell>{formatCurrency(item.nominal)}</TableCell>
                      <TableCell>
                        {(() => {
                          const isReviewTarget = isPendingReviewInstallment(item);

                          if (isReviewTarget) {
                            return (
                              <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                sx={{
                                  borderRadius: "10px",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                  bgcolor: "primary.main",
                                  "&:hover": { bgcolor: "primary.dark" },
                                }}
                                onClick={() => openPostponeModal(item)}
                              >
                                Konfirmasi Pending &gt;
                              </Button>
                            );
                          }

                          const canConfirm = isSameMonth(item.tanggal_pembayaran);
                          
                          // Jika sudah lunas atau ditunda, tampilkan labelnya langsung
                          if (item.status_pembayaran === "paid" || item.status_pembayaran === "postponed") {
                            return <Chip label={style.label} sx={style.sx} size="small" />;
                          }

                          // Jika bukan bulan ini, maka statusnya terkunci
                          if (!canConfirm) {
                            return (
                              <Chip
                                label="Terkunci"
                                size="small"
                                sx={{ backgroundColor: "#F3F4F6", color: "#64748B", fontWeight: 600 }}
                              />
                            );
                          }

                          // Jika bulan ini dan belum bayar, tampilkan checkbox konfirmasi
                          return (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Checkbox
                                checked={false}
                                size="small"
                                onChange={(e) => handleDirectConfirm(item, e.target.checked)}
                                disabled={saving || updatingInstallmentIds.includes(item.id)}
                                sx={{ p: 0 }}
                              />
                            </Stack>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && cicilanList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Belum ada data cicilan.
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
        handleClose={closePostponeModal}
        loanData={selectedInstallment}
        onApprove={handleApprovePostpone}
        onReject={handleRejectPostpone}
      />

      <LoanFeedbackSnackbar
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={handleCloseFeedback}
      />
    </Box>
  );
}

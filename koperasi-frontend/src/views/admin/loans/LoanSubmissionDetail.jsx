import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  IconUser,
  IconFileText,
  IconShieldCheck,
  IconCircleCheck,
  IconCircleX,
  IconDots,
  IconLock,
} from "@tabler/icons-react";

import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";

const LoanSubmissionDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [loan, setLoan] = React.useState(null);
  const [feedback, setFeedback] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openReject, setOpenReject] = React.useState(false);
  const [reason, setReason] = React.useState("");

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

  const showFeedback = (severity, message) => {
    setFeedback({ open: true, severity, message });
  };

  const handleCloseFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const handleSendApprove = async () => {
    try {
      const response = await api.patch(`/loans/${loanId}/approve`, {
        user_id: userId,
      });
      if (response.data.success) {
        showFeedback("success", response.data?.message || "Pengajuan berhasil dikonfirmasi admin.");
        fetchLoanDetail();
      }
    } catch (err) {
      showFeedback("error", err.response?.data?.message || "Gagal mengonfirmasi pengajuan.");
    }
  };

  const handleSendReject = async () => {
    if (!reason.trim()) {
      showFeedback("warning", "Alasan penolakan wajib diisi.");
      return;
    }
    try {
      const response = await api.patch(`/loans/${loanId}/reject`, {
        user_id: userId,
        reason,
      });
      if (response.data.success) {
        showFeedback("success", response.data?.message || "Pengajuan telah ditolak.");
        handleCloseReject();
        fetchLoanDetail();
      }
    } catch (err) {
      showFeedback("error", err.response?.data?.message || "Gagal menolak pengajuan.");
    }
  };

  const formatMonthYear = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  };

  const canApproveAsAdmin = loan?.status_pengajuan === "pending";

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress size={40} thickness={4} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Memuat detail pengajuan...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate("/admin/loans/pengajuan")} sx={{ cursor: "pointer" }}>
          Pengajuan Cicilan
        </Link>
        <Typography color="text.primary">Detail Pengajuan</Typography>
      </Breadcrumbs>

      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: "none", border: "1px solid #E5E7EB" }}>
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: loan?.status_pengajuan === "paid" ? "#DBEAFE" : "#FFF8E1",
                color: loan?.status_pengajuan === "paid" ? "#2563EB" : "#F59E0B",
                width: 44,
                height: 44
              }}
            >
              <IconFileText size="1.3rem" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={500} sx={{ color: "#94A3B8" }}>
                {loan?.loan_number ? `#${loan.loan_number}` : "-"}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#1E293B", mt: 0.2 }}>
                {loan?.status_pengajuan === "pending"
                  ? "Menunggu Konfirmasi Admin"
                  : loan?.status_pengajuan === "pending_pengajuan"
                    ? "Menunggu Konfirmasi Lead"
                    : loan?.status_pengajuan === "rejected"
                      ? "Ditolak"
                      : loan?.status_pengajuan === "paid"
                        ? "Lunas"
                        : "Pengajuan Diproses"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconUser size="1.1rem" color="#1e293b" />
                <Typography variant="h4" fontWeight={700}>Informasi Anggota</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Nama Anggota</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>: {loan?.user_name || "-"} — Biro SDM</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Gaji Pokok</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>: {formatCurrency(4500000)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconFileText size="1.1rem" color="#1e293b" />
                <Typography variant="h4" fontWeight={700}>Detail Pinjaman</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Jenis Pinjaman</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>: </Typography>
                    <Chip
                      label={String(loan?.type || "Produktif").toUpperCase()}
                      size="small"
                      sx={{ bgcolor: "#F3E8FF", color: "#9333EA", fontWeight: 700, px: 1, height: 24 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Tanggal Pengajuan</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>: {formatDate(loan?.created_at)}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Jumlah Pinjaman</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "primary.main" }}>: {formatCurrency(loan?.jumlah_pinjaman)}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Tenor</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>: {loan?.lama_pembayaran} Bulan</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Potong Gaji</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>: {formatMonthYear(loan?.bulan_potong_gaji)}</Typography>
                </Box>
                {loan?.document_url && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography variant="body1" sx={{ width: 140, color: "#64748B", fontWeight: 500 }}>Bukti Nota</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>: </Typography>
                      <Box 
                        component="img" 
                        src={loan.document_url} 
                        alt="Bukti Nota"
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          objectFit: 'cover', 
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid #E5E7EB',
                          ml: 1,
                          '&:hover': { opacity: 0.8 }
                        }} 
                        onClick={() => window.open(loan.document_url, '_blank')}
                      />
                      <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', cursor: 'pointer', fontWeight: 600 }} onClick={() => window.open(loan.document_url, '_blank')}>
                        Klik untuk memperbesar
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ mb: 1, display: "block", letterSpacing: 1 }}>ALASAN PINJAMAN</Typography>
                <Box
                  sx={{
                    bgcolor: "#f4f8faff",
                    p: 2.5,
                    borderRadius: "0 12px 12px 0",
                    borderLeft: "5px solid #6fa8c7ff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <Typography variant="body1" sx={{ color: "#505d6eff", fontWeight: 500, lineHeight: 1.6 }}>
                    {loan?.reason || "Tidak ada alasan yang dicantumkan oleh peminjam."}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <IconShieldCheck size="1.1rem" color="#1e293b" />
                <Typography variant="h4" fontWeight={700}>Aksi Konfirmasi Admin</Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!canApproveAsAdmin}
                  onClick={handleSendApprove}
                  startIcon={<IconCircleCheck size="1rem" />}
                  sx={{
                    bgcolor: "#35975a",
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#2d7f4b" },
                  }}
                >
                  {canApproveAsAdmin ? "Setujui Pengajuan" : "Sudah Diproses"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  disabled={!canApproveAsAdmin}
                  onClick={handleOpenReject}
                  startIcon={<IconCircleX size="1rem" />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Tolak Pengajuan
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="caption" fontWeight={700} color="text.secondary">ALUR PERSETUJUAN</Typography>
              <Stack spacing={2} mt={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: loan?.status_pengajuan === "pending" ? "#FFF8E1" : "#DCFCE7",
                      color: loan?.status_pengajuan === "pending" ? "#F59E0B" : "#16A34A",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <IconDots size="1rem" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loan?.status_pengajuan === "pending" ? "Menunggu Konfirmasi" : loan?.status_pengajuan === "rejected" && !loan?.tgl_acc_admin ? "Ditolak" : "Dikonfirmasi"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: loan?.status_pengajuan === "pending_pengajuan" ? "#E3F2FD" : (["disetujui_ketua", "aktif", "paid"].includes(loan?.status_pengajuan) ? "#DCFCE7" : "#F1F5F9"),
                      color: loan?.status_pengajuan === "pending_pengajuan" ? "#2196F3" : (["disetujui_ketua", "aktif", "paid"].includes(loan?.status_pengajuan) ? "#16A34A" : "#94A3B8"),
                      width: 32,
                      height: 32,
                    }}
                  >
                    <IconLock size="1rem" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Lead</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {loan?.status_pengajuan === "pending"
                        ? "Menunggu Admin"
                        : loan?.status_pengajuan === "pending_pengajuan"
                          ? "Menunggu Konfirmasi"
                          : loan?.status_pengajuan === "rejected" && loan?.tgl_acc_admin
                            ? "Ditolak"
                            : ["disetujui_ketua", "aktif", "paid"].includes(loan?.status_pengajuan)
                              ? "Disetujui"
                              : "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Dialog open={openReject} onClose={handleCloseReject} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Tolak Pengajuan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Berikan alasan penolakan untuk pengajuan ini agar user mendapatkan informasi yang jelas.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="Ketik alasan penolakan di sini..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseReject} color="inherit">Batal</Button>
          <Button onClick={handleSendReject} variant="contained" color="error">Ya, Tolak</Button>
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

export default LoanSubmissionDetailPage;
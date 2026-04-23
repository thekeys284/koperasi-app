import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import checkGreenIcon from "../../../assets/images/admin/check-green.svg";
import alertOrangeIcon from "../../../assets/images/admin/alert-orange.svg";

import {
  Card,
  CardContent,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  CircularProgress,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";
import PostponeInstallmentModal from "../../../ui-component/cards/Loans/Admin/PostponeInstallmentModal";

const getLoanStatusMeta = (loan) => {
  const statusPengajuan = loan?.status_pengajuan;

  if (statusPengajuan === "rejected") {
    return {
      label: "Ditolak",
      color: "#dc2626",
      bg: "#fee2e2",
      reason: loan?.status_reason || loan?.admin_note || loan?.reason || "Alasan penolakan tidak tersedia.",
    };
  }

  if (statusPengajuan === "paid") {
    return {
      label: "Lunas",
      color: "#2563eb",
      bg: "#dbeafe",
      reason: null,
    };
  }

  if (["disetujui_ketua", "pending_pengajuan", "aktif"].includes(statusPengajuan)) {
    return {
      label: "Aktif",
      color: "#16a34a",
      bg: "#dcfce7",
      reason: null,
    };
  }

  if (["pending", "postpone"].includes(statusPengajuan)) {
    return {
      label: "Pending",
      color: "#f59e0b",
      bg: "#fef3c7",
      reason: null,
    };
  }

  return {
    label: "Pending",
    color: "#f59e0b",
    bg: "#fef3c7",
    reason: null,
  };
};

const RejectionNote = ({ reason }) => {
  const [expanded, setExpanded] = React.useState(false);
  if (!reason) return null;

  const isLong = reason.length > 50;
  const displayText = expanded || !isLong ? reason : `${reason.substring(0, 50)}...`;

  return (
    <Box
      sx={{
        mt: 0.5,
        maxWidth: 180,
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

const StatusBadge = ({ loan }) => {
  const meta = getLoanStatusMeta(loan);

  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <Chip
        label={meta.label}
        size="small"
        sx={{
          background: meta.bg,
          color: meta.color,
          fontWeight: 600,
        }}
      />
      <RejectionNote reason={meta.reason} />
    </Stack>
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

import { formatCurrency, formatDate } from "../../../utils/format";

const isCurrentMonth = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

const hasCurrentMonthUnpaidInstallment = (loan) => {
  return Array.isArray(loan.cicilan) && loan.cicilan.some(
    (item) => item.tukin_status !== "sudah" && item.tukin_status !== "postponed" && isCurrentMonth(item.tanggal_pembayaran)
  );
};

const getCurrentMonthUnpaidInstallmentNo = (loan) => {
  if (!Array.isArray(loan.cicilan)) return Number.MAX_SAFE_INTEGER;

  const currentMonthInstallment = loan.cicilan.find(
    (item) => item.tukin_status !== "sudah" && isCurrentMonth(item.tanggal_pembayaran)
  );

  return currentMonthInstallment?.cicilan ?? Number.MAX_SAFE_INTEGER;
};

const getRunningLoanPriority = (loan) => {
  return loan.status_pengajuan === "postpone" ? 0 : 1;
};

// Categorize loans for new layout
const categorizeLoansByStatus = (loans) => {
  const postponementRequests = loans.filter((loan) => loan.status_pengajuan === "postpone");

  const paymentConfirmationLoans = loans.filter((loan) =>
    (loan.status_pengajuan === "disetujui_ketua") &&
    hasCurrentMonthUnpaidInstallment(loan) &&
    loan.status_pengajuan !== "postpone"
  );

  const activeLoansPaidThisMonth = loans.filter((loan) =>
    loan.status_pengajuan === "disetujui_ketua" &&
    !hasCurrentMonthUnpaidInstallment(loan)
  );

  const paidOffLoans = loans.filter((loan) => loan.status_pengajuan === "paid");

  return {
    postponementRequests,
    paymentConfirmationLoans,
    activeLoansPaidThisMonth,
    paidOffLoans
  };
};

const LoanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [summary, setSummary] = React.useState(null);
  const [loans, setLoans] = React.useState([]);
  const [tabValue, setTabValue] = React.useState(0);
  const [selectedInstallments, setSelectedInstallments] = React.useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [updatingInstallmentIds, setUpdatingInstallmentIds] = React.useState([]);
  const [feedback, setFeedback] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [postponeModal, setPostponeModal] = React.useState({
    open: false,
    loading: false,
    loan: null,
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/loans", {
        params: {
          all: 1,
          user_id: 1,
        },
      });
      setSummary(response.data?.summary || null);
      setLoans(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data pinjaman.");
    } finally {
      setLoading(false);
    }
  };

  const selectInstallment = (loan, installment) => {
    if (!installment || !loan?.id) return;

    setSelectedInstallments((prev) => {
      const exists = prev.some((item) => item.installmentId === installment.id);

      if (exists) {
        return prev.filter((item) => item.installmentId !== installment.id);
      }

      return [
        ...prev,
        {
          loanId: loan.id,
          loanNumber: loan.loan_number,
          userName: loan.user_name || "-",
          userUsername: loan.user_username || "-",
          installmentId: installment.id,
          installmentNo: installment.cicilan,
          installmentNominal: installment.nominal,
          installmentDate: installment.tanggal_pembayaran,
        },
      ];
    });

    setConfirmDialogOpen(false);
  };

  const isInstallmentSelected = (installmentId) => {
    return selectedInstallments.some((item) => item.installmentId === installmentId);
  };

  const isUpdatingSelectedInstallments = selectedInstallments.some((item) =>
    updatingInstallmentIds.includes(item.installmentId)
  );

  const confirmSelectedInstallment = async () => {
    if (selectedInstallments.length === 0) return;

    const validSelections = selectedInstallments
      .map((selectedItem) => {
        const loan = loans.find((item) => item.id === selectedItem.loanId);
        const installment = loan?.cicilan?.find((item) => item.id === selectedItem.installmentId);

        if (!loan || !installment) return null;

        return {
          loan,
          installment,
        };
      })
      .filter(Boolean);

    if (validSelections.length === 0) {
      setFeedback({
        open: true,
        severity: "error",
        message: "Data cicilan tidak ditemukan lagi. Silakan pilih ulang.",
      });
      setConfirmDialogOpen(false);
      setSelectedInstallments([]);
      return;
    }

    const selectedIds = validSelections.map((item) => item.installment.id);

    setUpdatingInstallmentIds((prev) => {
      const next = [...prev];
      selectedIds.forEach((id) => {
        if (!next.includes(id)) next.push(id);
      });
      return next;
    });

    try {
      const results = await Promise.allSettled(
        validSelections.map(({ loan, installment }) =>
          api.patch(`/loans/${loan.id}/cicilan/${installment.id}`, {
            tukin_status: "sudah",
            note: "Dikonfirmasi oleh admin",
          })
        )
      );

      const failedIds = [];
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failedIds.push(validSelections[index].installment.id);
        }
      });

      const successCount = validSelections.length - failedIds.length;

      setFeedback({
        open: true,
        severity: failedIds.length > 0 ? "warning" : "success",
        message:
          failedIds.length > 0
            ? `${successCount} cicilan berhasil dikonfirmasi, ${failedIds.length} cicilan gagal. Silakan coba lagi.`
            : `${successCount} cicilan berhasil dikonfirmasi`,
      });
      
      await fetchLoans();

      if (failedIds.length > 0) {
        setSelectedInstallments((prev) =>
          prev.filter((item) => failedIds.includes(item.installmentId))
        );
      } else {
        setSelectedInstallments([]);
        setConfirmDialogOpen(false);
      }
    } catch (err) {
      setFeedback({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Gagal mengubah status cicilan.",
      });
      await fetchLoans();
    } finally {
      setUpdatingInstallmentIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
    }
  };

  React.useEffect(() => {
    fetchLoans();
  }, []);

  const runningLoans = loans.filter((item) => (
    item.status_pengajuan === "disetujui_ketua" || item.status_pengajuan === "postpone"
  ));
  const { postponementRequests, paymentConfirmationLoans, activeLoansPaidThisMonth, paidOffLoans } = categorizeLoansByStatus(loans);

  const pendingConfirmationLoans = runningLoans
    .filter((item) => hasCurrentMonthUnpaidInstallment(item) || item.status_pengajuan === "postpone")
    .sort((a, b) => {
      const priorityDiff = getRunningLoanPriority(a) - getRunningLoanPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return getCurrentMonthUnpaidInstallmentNo(a) - getCurrentMonthUnpaidInstallmentNo(b);
    });
  const paidLoans = loans
    .filter((item) => (
      item.status_pengajuan === "paid" ||
      ((item.status_pengajuan === "disetujui_ketua" || item.status_pengajuan === "postpone") && !hasCurrentMonthUnpaidInstallment(item))
    ))
    .sort((a, b) => {
      // Priority: Active loans first, then Paid (Lunas) loans
      if (a.status_pengajuan !== "paid" && b.status_pengajuan === "paid") return -1;
      if (a.status_pengajuan === "paid" && b.status_pengajuan !== "paid") return 1;
      return 0;
    });
  const userLoans = loans.filter((item) => item.user_role === "user");
  const totalApprovedLoans = userLoans.filter((item) => (
    item.status_pengajuan === "disetujui_ketua"
  )).length;
  const totalPendingLoans = userLoans.filter((item) => ["pending", "postpone"].includes(item.status_pengajuan)).length;
  const totalPaidLoans = userLoans.filter((item) => item.status_pengajuan === "paid").length;

  const openLoanDetail = (loanId) => {
    navigate(`/admin/loans/details?loan_id=${loanId}&user_id=1`);
  };

  const openPostponeModal = (loan) => {
    const postponedInstallment = loan.cicilan?.find(c => c.id === loan.postpone_cicilan_id);
    setPostponeModal({
      open: true,
      loading: false,
      loan: {
        ...loan,
        installment: postponedInstallment?.cicilan,
        amount: postponedInstallment?.nominal,
        dueDate: postponedInstallment?.tanggal_pembayaran,
        postponement_reason: postponedInstallment?.postponement_reason,
      },
    });
  };

  const handlePostponeDecision = async (decision, { note }) => {
    if (!postponeModal.loan) return;

    try {
      setPostponeModal(prev => ({ ...prev, loading: true }));
      const endpoint = decision === "approve" ? "postpone-approve" : "postpone-reject";
      
      const response = await api.patch(`/loans/${postponeModal.loan.id}/${endpoint}`, {
        note,
        user_id: 1, // Fallback as usual
      });

      if (response.data?.success) {
        setFeedback({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        setPostponeModal({ open: false, loading: false, loan: null });
        await fetchLoans();
      }
    } catch (err) {
      setFeedback({
        open: true,
        severity: "error",
        message: err.response?.data?.message || `Gagal ${decision === "approve" ? "menyetujui" : "menolak"} penundaan.`,
      });
    } finally {
      setPostponeModal(prev => ({ ...prev, loading: false }));
    }
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
          color="text.primary"
          onClick={() => navigate("/admin/loans/daftar")}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pinjaman
        </Link>
      </Breadcrumbs>

      <Typography variant="h2" fontWeight={800} mb={1}>
        Daftar Pengajuan Pinjaman Aktif
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Kelola dan tinjau status pengajuan pinjaman anggota secara real-time.
      </Typography>

      {loading && (
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <CircularProgress size={22} />
          <Typography color="text.secondary">Memuat data pinjaman...</Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* STAT CARD */}
      <Stack direction="row" fontWeight={500} spacing={3} mb={4}>
        <StatCard
          title="Total Pinjaman Disetujui"
          value={totalApprovedLoans}
          color="green"
          icon={<img src={checkGreenIcon} width={24} />}
        />

        <StatCard
          title="Total Pinjaman Pending"
          value={totalPendingLoans}
          color="orange"
          icon={<img src={alertOrangeIcon} width={24} />}
          badge="Pending"
          badgeColor="orange"
        />

        <StatCard
          title="Total Pinjaman Lunas"
          value={totalPaidLoans}
          color="blue"
          icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24, color: "#2563eb" }} />}
        />
      </Stack>

      {/* TABLE DAFTAR KONFIRMASI PENUNDAAN */}
      {postponementRequests.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Typography color="text.primary" fontSize="18px" fontWeight={800} mb={2}>
              Daftar Konfirmasi Penundaan Cicilan
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 600, "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", py: 2, px: 2 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F8FAFC", "& .MuiTableCell-head": { fontWeight: 700, fontSize: "12px", color: "#475569", textTransform: "uppercase", borderBottom: "2px solid #E2E8F0" } }}>
                    <TableCell>ID PENGAJUAN</TableCell>
                    <TableCell>ANGGOTA</TableCell>
                    <TableCell>JENIS PINJAMAN</TableCell>
                    <TableCell>CICILAN KE</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell align="center">AKSI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postponementRequests.map((loan) => {
                    const postponedInstallment = loan.cicilan?.find(c => c.id === loan.postpone_cicilan_id);
                    const installmentNo = postponedInstallment ? postponedInstallment.cicilan : "-";

                    return (
                      <TableRow key={`postpone-${loan.id}`} hover>
                        <TableCell>
                          <Typography color="primary" fontWeight={600} sx={{ fontSize: "14px" }}>
                            #{loan.loan_number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(loan.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loan.user_username || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                            <LoanTypeBadge type={loan.type_slug} />
                            <LoanModeBadge mode={loan.loan_mode} />
                          </Stack>
                          <Typography fontWeight={700} sx={{ fontSize: "14px" }}>
                            {formatCurrency(loan.jumlah_pinjaman)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} sx={{ fontSize: "14px" }}>
                            {installmentNo}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              display: "block", 
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontStyle: "italic"
                            }}
                          >
                            Alasan: {postponedInstallment?.postponement_reason || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="PENDING" 
                            size="small" 
                            sx={{ 
                              bgcolor: "#fef3c7", 
                              color: "#d97706", 
                              fontWeight: 700, 
                              fontSize: "10px",
                              borderRadius: "6px"
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => openPostponeModal(loan)}
                              endIcon={<NavigateNextIcon />}
                              sx={{ 
                                textTransform: "none", 
                                fontWeight: 600,
                                borderRadius: "8px",
                                bgcolor: "#eff6ff",
                                color: "#1e40af",
                                boxShadow: "none",
                                border: "1px solid #dbeafe",
                                "&:hover": {
                                  bgcolor: "#dbeafe",
                                  boxShadow: "none",
                                  border: "1px solid #bfdbfe",
                                }
                              }}
                            >
                              Review
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => openLoanDetail(loan.id)}
                              sx={{ 
                                bgcolor: "#f1f5f9",
                                color: "#64748b",
                                "&:hover": { bgcolor: "#e2e8f0" }
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* TABLE DAFTAR KONFIRMASI CICILAN */}
      {paymentConfirmationLoans.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
              <Box>
                <Typography color="text.primary" fontSize="18px" fontWeight={800}>
                  Daftar Konfirmasi Cicilan Bulan Ini
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pilih satu baris dulu, lalu konfirmasi dari tombol di kanan atas.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<CheckCircleOutlineIcon />}
                disabled={selectedInstallments.length === 0 || isUpdatingSelectedInstallments}
                onClick={() => setConfirmDialogOpen(true)}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, boxShadow: "none" }}
              >
                Konfirmasi Terpilih ({selectedInstallments.length})
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 600, "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", py: 2, px: 2 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F8FAFC", "& .MuiTableCell-head": { 
                    fontWeight: 700, fontSize: "12px", color: "#475569", textTransform: "uppercase", borderBottom: "2px solid #E2E8F0" } }}>
                    <TableCell>ID & TGL PENGAJUAN</TableCell>
                    <TableCell>ANGGOTA</TableCell>
                    <TableCell>JENIS & JUMLAH</TableCell>
                    <TableCell>TENOR</TableCell>
                    <TableCell>RINCIAN CICILAN</TableCell>
                    <TableCell sx={{ width: "150px"}}>STATUS</TableCell>
                    <TableCell sx={{ width: "110px" }}>DETAIL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentConfirmationLoans.map((loan) => {
                    const currentInstallment = loan.cicilan?.find(
                      (item) => isCurrentMonth(item.tanggal_pembayaran)
                    );
                    const isSelected = !!currentInstallment && isInstallmentSelected(currentInstallment.id);

                    return (
                      <TableRow
                        key={`confirm-${loan.id}`}
                        selected={isSelected}
                        sx={{
                          cursor: currentInstallment ? "pointer" : "default",
                          "&.Mui-selected > *": {
                            backgroundColor: "#EFF6FF",
                          },
                          "&.Mui-selected:hover > *": {
                            backgroundColor: "#DBEAFE",
                          },
                        }}
                        onClick={() => currentInstallment && selectInstallment(loan, currentInstallment)}
                      >
                        <TableCell>
                          <Typography color="primary" fontWeight={600}>#{loan.loan_number}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(loan.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">{loan.user_username || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                            <LoanTypeBadge type={loan.type_slug} />
                            <LoanModeBadge mode={loan.loan_mode} />
                          </Stack>
                          <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                          {loan.referred_loan?.loan_number && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              Ref: #{loan.referred_loan.loan_number}
                            </Typography>
                          )}
                          {loan.document_url && (
                             <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: "#2563eb", 
                                    fontWeight: 700, 
                                    mt: 0.5, 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: 0.5,
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" }
                                }}
                                onClick={(e) => { e.stopPropagation(); window.open(loan.document_url, '_blank'); }}
                             >
                                [ Lihat Nota ]
                             </Typography>
                          )}
                        </TableCell>
                        <TableCell>{loan.lama_pembayaran} Bulan</TableCell>
                        <TableCell>
                          {!currentInstallment ? "-" : (
                            <Box>
                              <Typography fontWeight={700} fontSize="13px">
                                {formatCurrency(currentInstallment.nominal)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Cicilan ke-{currentInstallment.cicilan}
                              </Typography>
                              <Typography variant="caption" color="primary.main" fontWeight={600}>
                                Tgl: {formatDate(currentInstallment.tanggal_pembayaran)}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge loan={loan} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {currentInstallment && (
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onClick={(event) => event.stopPropagation()}
                                onChange={() => selectInstallment(loan, currentInstallment)}
                                disabled={updatingInstallmentIds.includes(currentInstallment.id)}
                                sx={{ p: 0.5 }}
                              />
                            )}
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                openLoanDetail(loan.id);
                              }}
                              size="small"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* TABLE DAFTAR PINJAMAN AKTIF DAN TERBAYAR - DENGAN TABS */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Pinjaman Aktif" />
              <Tab label="Riwayat Pinjaman Lunas" />
            </Tabs>
          </Box>

          {/* TAB 0: PINJAMAN AKTIF */}
          {tabValue === 0 && (
            <Box sx={{ pt: 2 }}>
              <Typography color="text.primary" fontSize="16px" fontWeight={700} mb={2}>
                Daftar Pinjaman Aktif dan Terbayar
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 600, "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", py: 2, px: 2 } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC", "& .MuiTableCell-head": { fontWeight: 700, fontSize: "12px", color: "#475569", textTransform: "uppercase", borderBottom: "2px solid #E2E8F0" } }}>
                      <TableCell>ID & TGL PENGAJUAN</TableCell>
                      <TableCell>ANGGOTA</TableCell>
                      <TableCell>JENIS & JUMLAH</TableCell>
                      <TableCell>TENOR</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell>DETAIL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeLoansPaidThisMonth.map((loan) => (
                      <TableRow key={`active-${loan.id}`}>
                        <TableCell>
                          <Typography color="primary" fontWeight={600}>#{loan.loan_number}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(loan.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">{loan.user_username || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                            <LoanTypeBadge type={loan.type_slug} />
                            <LoanModeBadge mode={loan.loan_mode} />
                          </Stack>
                          <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                          {loan.referred_loan?.loan_number && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              Ref: #{loan.referred_loan.loan_number}
                            </Typography>
                          )}
                          {loan.document_url && (
                             <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: "#2563eb", 
                                    fontWeight: 700, 
                                    mt: 0.5, 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: 0.5,
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" }
                                }}
                                onClick={(e) => { e.stopPropagation(); window.open(loan.document_url, '_blank'); }}
                             >
                                [ Lihat Nota ]
                             </Typography>
                          )}
                        </TableCell>
                        <TableCell>{loan.lama_pembayaran} Bulan</TableCell>
                        <TableCell>
                          <StatusBadge loan={loan} />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => openLoanDetail(loan.id)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeLoansPaidThisMonth.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Tidak ada pinjaman aktif saat ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Menampilkan {activeLoansPaidThisMonth.length} pinjaman aktif.
              </Typography>
            </Box>
          )}

          {/* TAB 1: RIWAYAT PINJAMAN LUNAS */}
          {tabValue === 1 && (
            <Box sx={{ pt: 2 }}>
              <Typography color="text.primary" fontSize="16px" fontWeight={700} mb={2}>
                Riwayat Pinjaman Lunas
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 600, "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", py: 2, px: 2 } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC", "& .MuiTableCell-head": { fontWeight: 700, fontSize: "12px", color: "#475569", textTransform: "uppercase", borderBottom: "2px solid #E2E8F0" } }}>
                      <TableCell>ID & TGL PENGAJUAN</TableCell>
                      <TableCell>ANGGOTA</TableCell>
                      <TableCell>JENIS & JUMLAH</TableCell>
                      <TableCell>TENOR</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell>DETAIL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paidOffLoans.map((loan) => (
                      <TableRow key={`paid-${loan.id}`}>
                        <TableCell>
                          <Typography color="primary" fontWeight={600}>#{loan.loan_number}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(loan.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                          <Typography variant="caption" color="text.secondary">{loan.user_username || "-"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                            <LoanTypeBadge type={loan.type_slug} />
                            <LoanModeBadge mode={loan.loan_mode} />
                          </Stack>
                          <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                          {loan.referred_loan?.loan_number && (
                            <Typography variant="caption" color="text.secondary">
                              Ref: #{loan.referred_loan.loan_number}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{loan.lama_pembayaran} Bulan</TableCell>
                        <TableCell>
                          <StatusBadge loan={loan} />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => openLoanDetail(loan.id)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paidOffLoans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Tidak ada pinjaman yang sudah lunas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Menampilkan {paidOffLoans.length} pinjaman yang sudah lunas.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => {
          if (isUpdatingSelectedInstallments) return;
          setConfirmDialogOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, p: 1, width: "100%", maxWidth: 520 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Konfirmasi Pembayaran Cicilan
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Apakah Anda ingin menyetujui pembayaran cicilan pada {selectedInstallments.length} anggota berikut:
          </Typography>
          <Box 
            sx={{ 
              bgcolor: "#F8FAFC", 
              p: 2, 
              borderRadius: 2, 
              border: "1px solid #CBD5E1", 
              maxHeight: 100, 
              overflowY: "auto",
              boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: "10px" }
            }}
          >
            {selectedInstallments.map((item, idx) => (
              <Typography key={item.installmentId} variant="body2" fontWeight={700} color="primary" sx={{ mb: 0.8 }}>
                {idx + 1}. {item.userName}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={isUpdatingSelectedInstallments}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={confirmSelectedInstallment}
            disabled={selectedInstallments.length === 0 || isUpdatingSelectedInstallments}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 2.5, boxShadow: "none" }}
          >
            {isUpdatingSelectedInstallments
              ? "Menyimpan..."
              : `Ya, Konfirmasi ${selectedInstallments.length} Cicilan`}
          </Button>
        </DialogActions>
      </Dialog>

      <PostponeInstallmentModal
        open={postponeModal.open}
        handleClose={() => setPostponeModal({ ...postponeModal, open: false })}
        loanData={postponeModal.loan}
        loading={postponeModal.loading}
        onApprove={(data) => handlePostponeDecision("approve", data)}
        onReject={(data) => handlePostponeDecision("reject", data)}
      />

      <LoanFeedbackSnackbar
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={() => setFeedback({ ...feedback, open: false })}
      />
    </Box>
  );
};

export default LoanPage;
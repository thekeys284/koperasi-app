import React, { useState } from "react";
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
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import ConfirmPaymentModal from "../../../ui-component/cards/Loans/Admin/ConfirmPaymentModal";
import PostponeInstallmentModal from "../../../ui-component/cards/Loans/Admin/PostponeInstallmentModal";
import api from "../../../api/axios";

export default function LoanDetails() {
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [saving, setSaving] = useState(false);
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

  const handleConfirmPayment = async ({ tukinStatus, note }) => {
    if (!selectedInstallment || !loan?.id) {
      setOpenConfirmModal(false);
      setSelectedInstallment(null);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.patch(`/loans/${loan.id}/cicilan/${selectedInstallment.id}`, {
        tukin_status: tukinStatus,
        note,
      });

      // Refresh loan details after successful confirmation
      await fetchLoanDetail();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan status cicilan.");
    } finally {
      setSaving(false);
      setSelectedInstallment(null);
      setOpenConfirmModal(false);
    }
  };

  const fetchLoanDetail = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  const isAdmin = location.pathname.includes("/admin");
  const basePath = isAdmin ? "/admin/loans" : "/user/loans";
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
  const sisaCicilan = cicilanList.filter((item) => item.tukin_status !== "sudah").length;

  const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const mapCicilanStatus = (item) => {
    if (item.tukin_status === "sudah") return { label: "Sudah Bayar", color: "success" };
    if (loan?.status_pengajuan === "pending_pengajuan") return { label: "Menunggu Review", color: "info" };
    return { label: "Belum Bayar", color: "warning" };
  };

  const openPostponeModal = (installment) => {
    setSelectedInstallment({
      ...installment,
      loan_number: loan?.loan_number,
      reason: loan?.reason,
      admin_note: loan?.admin_note
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
        tukin_status: "belum",
        admin_note: note,
      });
      await fetchLoanDetail();
      closePostponeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyetujui penundaan.");
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPostpone = async ({ note }) => {
    if (!selectedInstallment || !loan?.id) return;

    setSaving(true);
    setError("");
    try {
      // Just update mortality/note if rejected, or maybe we need a status for rejected
      await api.patch(`/loans/${loan.id}/cicilan/${selectedInstallment.id}`, {
        tukin_status: "pending", // Keep it pending but update note
        admin_note: note,
      });
      await fetchLoanDetail();
      closePostponeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menolak penundaan.");
    } finally {
      setSaving(false);
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
          color="inherit"
          onClick={() => navigate(basePath)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pinjaman
        </Link>
        <Typography color="text.primary">Detail Pinjaman</Typography>
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
        mt={1}
      >
        <Box> 
          <Typography variant="h5" fontWeight={700}>
            ID Pinjam: {loan?.loan_number ? `#${loan.loan_number}` : "-"}
          </Typography>
        </Box>

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
          </CardContent>
        </Card>
      </Stack>

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
                  const status = mapCicilanStatus(item);
                  return (
                    <TableRow key={item.id} sx={item.tukin_status !== "sudah" ? { background: "#eef2ff" } : undefined}>
                      <TableCell>#{`CIC-${String(item.id).padStart(4, "0")}`}</TableCell>
                      <TableCell>{item.cicilan}</TableCell>
                      <TableCell>{formatDate(item.tanggal_pembayaran)}</TableCell>
                              <TableCell>{formatCurrency(item.nominal)}</TableCell>
                      <TableCell>
                        {item.tukin_status === "sudah" ? (
                          <Chip label={status.label} color={status.color} size="small" />
                        ) : (() => {
                          const canConfirm = isSameMonth(item.tanggal_pembayaran);
                          const dueDate = parseDate(item.tanggal_pembayaran);
                          const isLocked = !canConfirm;
                          if (isLocked) {
                            return (
                              <Chip
                                label="Terkunci"
                                size="small"
                                sx={{ backgroundColor: "#F3F4F6", color: "#64748B", fontWeight: 600 }}
                              />
                            );
                          }

                          if (loan?.status_pengajuan === "pending_pengajuan") {
                            return (
                              <Button
                                variant="contained"
                                size="small"
                                color="info"
                                sx={{ borderRadius: 3, textTransform: "none" }}
                                onClick={() => openPostponeModal(item)}
                              >
                                Review &gt;
                              </Button>
                            );
                          }

                          return (
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ borderRadius: 3, textTransform: "none" }}
                              onClick={() => {
                                setSelectedInstallment(item);
                                setOpenConfirmModal(true);
                              }}
                            >
                              Konfirmasi Pembayaran &gt;
                            </Button>
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

      <ConfirmPaymentModal
        open={openConfirmModal}
        handleClose={() => {
          setOpenConfirmModal(false);
          setSelectedInstallment(null);
        }}
        loanData={{
          id: loan?.loan_number ? `#${loan.loan_number}` : "-",
          installment: selectedInstallment?.cicilan || cicilanList.find((item) => item.tukin_status !== "sudah")?.cicilan,
          amount: formatCurrency(selectedInstallment?.nominal || cicilanList.find((item) => item.tukin_status !== "sudah")?.nominal || 0),
          dueDate: formatDate(selectedInstallment?.tanggal_pembayaran || cicilanList.find((item) => item.tukin_status !== "sudah")?.tanggal_pembayaran),
        }}
        onSubmit={handleConfirmPayment}
        loading={saving}
      />
      <PostponeInstallmentModal
        open={postponeModalOpen}
        handleClose={closePostponeModal}
        loanData={selectedInstallment}
        onApprove={handleApprovePostpone}
        onReject={handleRejectPostpone}
      />
    </Box>
  );
}
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import checkGreenIcon from "../../../assets/images/admin/check-green.svg";
import alertOrangeIcon from "../../../assets/images/admin/alert-orange.svg";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
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
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

  if (["disetujui_ketua", "pending_pengajuan", "aktif", "paid"].includes(statusPengajuan)) {
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
    <Stack spacing={0.5}>
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

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

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

const hasPendingPostponement = (loan) => {
  return loan.status_pengajuan === "postpone";
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

const getLoanListStatusLabel = (loan) => {
  if (loan.status === "pending") return "Pending";
  if (loan.status === "aktif" && hasCurrentMonthUnpaidInstallment(loan)) return "Menunggu Konfirmasi";
  return "Aktif";
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

  React.useEffect(() => {
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
          title="Total Pinjaman Paid"
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
                    <TableCell>ID & TGL PENGAJUAN</TableCell>
                    <TableCell>ANGGOTA</TableCell>
                    <TableCell>JENIS & JUMLAH</TableCell>
                    <TableCell>ALASAN PENUNDAAN</TableCell>
                    <TableCell>DETAIL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {postponementRequests.map((loan) => (
                    <TableRow key={`postpone-${loan.id}`}>
                      <TableCell>
                        <Typography color="primary" fontWeight={600}>#{loan.loan_number}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDate(loan.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                        <Typography variant="caption" color="text.secondary">{loan.user_username || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <LoanTypeBadge type={loan.type_slug} />
                        <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontSize={13}>{loan.reason || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => openLoanDetail(loan.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <Typography color="text.primary" fontSize="18px" fontWeight={800} mb={2}>
              Daftar Konfirmasi Cicilan Bulan Ini
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
                  {paymentConfirmationLoans.map((loan) => (
                    <TableRow key={`confirm-${loan.id}`}>
                      <TableCell>
                        <Typography color="primary" fontWeight={600}>#{loan.loan_number}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDate(loan.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{loan.user_name || "-"}</Typography>
                        <Typography variant="caption" color="text.secondary">{loan.user_username || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <LoanTypeBadge type={loan.type_slug} />
                        <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
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
                          <LoanTypeBadge type={loan.type_slug} />
                          <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
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
                          <LoanTypeBadge type={loan.type_slug} />
                          <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
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
    </Box>
  );
};

export default LoanPage;
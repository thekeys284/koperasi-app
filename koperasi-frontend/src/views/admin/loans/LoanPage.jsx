import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import checkGreenIcon from "../../../assets/images/admin/check-green.svg";
import alertOrangeIcon from "../../../assets/images/admin/alert-orange.svg";

import {
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
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    aktif: {
      label: "Aktif",
      color: "#16a34a",
      bg: "#dcfce7",
    },
    lunas: {
      label: "Lunas",
      color: "#2563eb",
      bg: "#dbeafe",
    },
    rejected: {
      label: "Ditolak",
      color: "#dc2626",
      bg: "#fee2e2",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        background: config.bg,
        color: config.color,
        fontWeight: 600,
      }}
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

const isCurrentMonth = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

const hasCurrentMonthUnpaidInstallment = (loan) => {
  return Array.isArray(loan.cicilan) && loan.cicilan.some(
    (item) => item.tukin_status !== "sudah" && isCurrentMonth(item.tanggal_pembayaran)
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
  return loan.status_pengajuan === "pending_pengajuan" ? 0 : 1;
};

const getLoanListStatusLabel = (loan) => {
  if (loan.status === "pending") return "Pending";
  if (loan.status === "aktif" && hasCurrentMonthUnpaidInstallment(loan)) return "Menunggu Konfirmasi";
  return "Aktif";
};

const LoanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [summary, setSummary] = React.useState(null);
  const [loans, setLoans] = React.useState([]);

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
    item.status_pengajuan === "disetujui_ketua" || item.status_pengajuan === "pending_pengajuan"
  ));
  const pendingConfirmationLoans = runningLoans
    .filter((item) => hasCurrentMonthUnpaidInstallment(item))
    .sort((a, b) => {
      const priorityDiff = getRunningLoanPriority(a) - getRunningLoanPriority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return getCurrentMonthUnpaidInstallmentNo(a) - getCurrentMonthUnpaidInstallmentNo(b);
    });
  const paidLoans = loans
    .filter((item) => (
      item.status_pengajuan === "paid" || 
      ((item.status_pengajuan === "disetujui_ketua" || item.status_pengajuan === "pending_pengajuan") && !hasCurrentMonthUnpaidInstallment(item))
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
  const totalPendingLoans = userLoans.filter((item) => item.status_pengajuan === "pending_pengajuan").length;
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
          onClick={() => navigate("/admin/loans")}
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

      {/* TABLE BULAN BERJALAN */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography
            color="text.primary"
            fontSize="18px"
            fontWeight={800}
            mb={2}
          >
            Daftar pinjaman berjalan dan menunggu konfirmasi cicilan
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
                  <TableCell>ID & TGL PENGAJUAN</TableCell>
                  <TableCell>ANGGOTA</TableCell>
                  <TableCell>JENIS & JUMLAH</TableCell>
                  <TableCell>TENOR</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>DETAIL</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pendingConfirmationLoans.map((loan) => (
                  <TableRow key={`pending-${loan.id}`}>
                    <TableCell>
                      <Typography color="primary" fontWeight={600}>
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
                      <LoanTypeBadge type={loan.type_slug} />
                      <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                    </TableCell>

                    <TableCell>{loan.lama_pembayaran} Bulan</TableCell>

                    <TableCell>
                      <StatusBadge
                        status={loan.status_pengajuan === "pending_pengajuan" ? "pending" : loan.status}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => openLoanDetail(loan.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && pendingConfirmationLoans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Tidak ada pinjaman bulan berjalan yang menunggu konfirmasi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Typography variant="body2" color="text.secondary" mt={2}>
            Menampilkan {pendingConfirmationLoans.length} pinjaman berjalan yang menunggu konfirmasi cicilan.
          </Typography>
        </CardContent>
      </Card>

      {/* TABLE PINJAMAN AKTIF */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography color="text.primary" fontSize="18px" fontWeight={800} mb={2}>
              Daftar Pinjaman Aktif Terbayar Cicilan Bulan Ini
            </Typography>
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
                  <TableCell>ID & TGL PENGAJUAN</TableCell>
                  <TableCell>ANGGOTA</TableCell>
                  <TableCell>JENIS & JUMLAH</TableCell>
                  <TableCell>TENOR</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>DETAIL</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paidLoans.map((loan) => (
                  <TableRow key={`active-${loan.id}`}>
                    <TableCell>
                      <Typography color="primary" fontWeight={600}>
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
                      <LoanTypeBadge type={loan.type_slug} />
                      <Typography fontWeight={700}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                    </TableCell>

                    <TableCell>{loan.lama_pembayaran} Bulan</TableCell>

                    <TableCell>
                      <StatusBadge status={loan.status} />
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => openLoanDetail(loan.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && paidLoans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Tidak ada pinjaman paid saat ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Typography variant="body2" color="text.secondary" mt={2}>
            Menampilkan {paidLoans.length} data pinjaman aktif dengan cicilan bulan ini terbayar.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanPage;
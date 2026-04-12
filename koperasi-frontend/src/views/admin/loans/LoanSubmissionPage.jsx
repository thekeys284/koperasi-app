import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import fileBlueIcon from "assets/images/lead/fileBlueIcon.png";
import processOrangeIcon from "assets/images/lead/processOrangeIcon.png";
import checkGreenIcon from "assets/images/lead/checkGreenIcon.png";

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
  Tab
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const statusPengajuan = loan?.status_pengajuan;

  let config = {
    label: "Menunggu Konfirmasi",
    color: "#f59e0b",
    bg: "#fef3c7",
    reason: null
  };

  if (statusPengajuan === "rejected") {
    config = {
      label: "Ditolak",
      color: "#dc2626",
      bg: "#fee2e2",
      reason: loan?.status_reason || loan?.admin_note || loan?.reason || "Alasan penolakan tidak tersedia."
    };
  } else if (["pending_pengajuan"].includes(statusPengajuan)) {
    config = {
      label: "Terkonfirmasi Admin",
      color: "#2563eb",
      bg: "#dbeafe",
      reason: null
    };
  } else if (["disetujui_ketua", "aktif", "paid"].includes(statusPengajuan)) {
    config = {
      label: "Selesai",
      color: "#16a34a",
      bg: "#dcfce7",
      reason: null
    };
  }

  return (
    <Stack spacing={0.5}>
      <Chip
        label={config.label}
        size="small"
        sx={{
          background: config.bg,
          color: config.color,
          fontWeight: 600
        }}
      />
      <RejectionNote reason={config.reason} />
    </Stack>
  );
};

const LoanTypeBadge = ({ type }) => {
  const config = {
    konsumtif: { bg: "#F3E8FF", color: "#9333EA" },
    produktif: { bg: "#DBEAFE", color: "#2563EB" }
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
        textTransform: "uppercase"
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

const LoanSubmissionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [loans, setLoans] = React.useState([]);
  const [summary, setSummary] = React.useState({
    total: 0,
    pending: 0,
    confirmed: 0
  });
  const [tabValue, setTabValue] = React.useState(0);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/loans", {
        params: {
          all: 1,
          user_id: 1
        }
      });
      const fetchedLoans = response.data?.data || [];
      setLoans(fetchedLoans);

      setSummary({
        total: fetchedLoans.length,
        pending: fetchedLoans.filter((l) => l.status_pengajuan === "pending").length,
        confirmed: fetchedLoans.filter((l) => ["pending_pengajuan", "disetujui_ketua", "aktif", "paid"].includes(l.status_pengajuan)).length
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data pinjaman.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLoans();
  }, []);

  const openLoanDetail = (loanId, userId) => {
    navigate(`/admin/loans/pengajuan/details?loan_id=${loanId}&user_id=${userId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredLoans = tabValue === 0
    ? loans.filter((l) => l.status_pengajuan === "pending")
    : loans.filter((l) => l.status_pengajuan !== "pending");

  return (
    <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="text.primary"
          onClick={() => navigate("/admin/loans/pengajuan")}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pengajuan Cicilan
        </Link>
      </Breadcrumbs>

      <Typography variant="h2" fontWeight={800} mb={1}>
        Daftar Pengajuan Cicilan (Admin)
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Konfirmasi tahap pertama pengajuan pinjaman sebelum diteruskan ke Lead.
      </Typography>

      {loading && (
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <CircularProgress size={22} />
          <Typography color="text.secondary">Memuat data pengajuan...</Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={3} mb={4}>
        <StatCard
          title="Total Pengajuan"
          value={summary.total}
          color="blue"
          icon={<img src={fileBlueIcon} width={24} alt="Total" />}
        />

        <StatCard
          title="Menunggu Konfirmasi"
          value={summary.pending}
          color="orange"
          icon={<img src={processOrangeIcon} width={24} alt="Process" />}
          badge="Pending"
          badgeColor="orange"
        />

        <StatCard
          title="Terkonfirmasi Admin"
          value={summary.confirmed}
          color="green"
          icon={<img src={checkGreenIcon} width={24} alt="Confirmed" />}
        />
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label={`Perlu Konfirmasi (${loans.filter((l) => l.status_pengajuan === "pending").length})`} sx={{ fontWeight: 700, textTransform: "none" }} />
            <Tab label="Riwayat Pengajuan" sx={{ fontWeight: 700, textTransform: "none" }} />
          </Tabs>
        </Box>
        <CardContent>
          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 600,
                "& .MuiTableBody-root .MuiTableRow-root": {
                  transition: "background-color 0.2s"
                },
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: "#F8FAFC"
                },
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #F1F5F9",
                  py: 2,
                  px: 1
                }
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
                      borderBottom: "2px solid #E2E8F0"
                    }
                  }}
                >
                  <TableCell>ID & TGL PENGAJUAN</TableCell>
                  <TableCell>ANGGOTA</TableCell>
                  <TableCell>JENIS & JUMLAH</TableCell>
                  <TableCell>TENOR</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="center">AKSI</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Typography color="primary" fontWeight={700}>
                        #{loan.loan_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(loan.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700} color="#1E293B">{loan.user_name || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loan.user_username || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <LoanTypeBadge type={loan.type_slug} />
                      <Typography fontWeight={800} sx={{ mt: 0.5 }}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>{loan.lama_pembayaran} Bulan</TableCell>

                    <TableCell>
                      <StatusBadge loan={loan} />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton onClick={() => openLoanDetail(loan.id, loan.user_id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && filteredLoans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Tidak ada data pengajuan pada kategori ini.</Typography>
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

export default LoanSubmissionPage;

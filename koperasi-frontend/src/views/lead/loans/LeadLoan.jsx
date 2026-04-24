import React from "react";
import { formatCurrency, formatDate } from "../../../utils/format";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import StatCard from "../../../ui-component/cards/Loans/Pjtoko/StatCard";
// icons
import fileBlueIcon from 'assets/images/lead/fileBlueIcon.png';
import processOrangeIcon from 'assets/images/lead/processOrangeIcon.png';
import checkGreenIcon from 'assets/images/lead/checkGreenIcon.png';

import {
  Card,
  CardContent,
  Typography,
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
import LoanTable from "../../../ui-component/cards/Loans/LoanTable";
import { LoanStatusBadge, LoanTypeBadge, LoanModeBadge } from "../../../ui-component/cards/Loans/LoanBadges";





const LeadLoanPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [loans, setLoans] = React.useState([]);
    const [summary, setSummary] = React.useState({
        total: 0,
        pending: 0,
        approved: 0
    });
    const [tabValue, setTabValue] = React.useState(0);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await api.get("/loans", {
                params: {
                    all: 1,
                    user_id: 1, 
                },
            });
            const fetchedLoans = response.data?.data || [];
            setLoans(fetchedLoans);
            
            const apiSummary = response.data?.summary;
            setSummary({
                total: apiSummary?.total_pengajuan || fetchedLoans.length,
                pending: fetchedLoans.filter(l => l.status_pengajuan === 'pending_pengajuan').length,
                approved: (apiSummary?.total_disetujui || 0) + (apiSummary?.total_lunas || 0)
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
        navigate(`/lead/loans/pengajuan/details?loan_id=${loanId}&user_id=${userId}`);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredLoans = tabValue === 0 
        ? loans.filter(l => l.status_pengajuan === 'pending_pengajuan')
        : loans.filter(l => l.status_pengajuan !== 'pending_pengajuan');
    const leadColumns = [
        {
            header: "ID & TGL PENGAJUAN",
            render: (loan) => (
                <>
                    <Typography color="primary" fontWeight={700}>
                        #{loan.loan_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatDate(loan.created_at)}
                    </Typography>
                </>
            )
        },
        {
            header: "ANGGOTA",
            render: (loan) => (
                <>
                    <Typography fontWeight={700} color="#1E293B">{loan.user_name || "-"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {loan.user_username || "-"}
                    </Typography>
                </>
            )
        },
        {
            header: "JENIS & JUMLAH",
            render: (loan) => (
                <>
                    <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                        <LoanTypeBadge type={loan.type_slug} />
                        <LoanModeBadge mode={loan.loan_mode} />
                    </Stack>
                    <Typography fontWeight={800} sx={{ mt: 0.5 }}>{formatCurrency(loan.jumlah_pinjaman)}</Typography>
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
                </>
            )
        },
        {
            header: "TENOR",
            render: (loan) => <span style={{ fontWeight: 600 }}>{loan.lama_pembayaran} Bulan</span>
        },
        {
            header: "STATUS",
            align: "center",
            render: (loan) => (
                <LoanStatusBadge 
                    status={loan.status_pengajuan} 
                    reason={loan?.status_reason || loan?.pjtoko_note || loan?.reason} 
                />
            )
        },
        {
            header: "AKSI",
            align: "center",
            render: (loan) => (
                <IconButton onClick={() => openLoanDetail(loan.id, loan.user_id)}>
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

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
                    onClick={() => navigate("/lead/loans/pengajuan")}
                    sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                    Daftar Pengajuan
                </Link>
            </Breadcrumbs>

            <Typography variant="h2" fontWeight={800} mb={1}>
                Daftar Permohonan Pinjaman (Lead)
            </Typography>

            <Typography color="text.secondary" mb={4}>
                Kelola dan tinjau status pengajuan pinjaman anggota secara real-time sebagai Ketua Koperasi.
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
            <Stack direction="row" spacing={3} mb={4}>
                <StatCard
                    title="Total Pengajuan"
                    value={summary.total}
                    color="blue"
                    icon={<img src={fileBlueIcon} width={24} alt="Total" />}
                />

                <StatCard
                    title="Sedang Diproses"
                    value={summary.pending}
                    color="orange"
                    icon={<img src={processOrangeIcon} width={24} alt="Process" />}
                    badge="Pending"
                    badgeColor="orange"
                />

                <StatCard
                    title="Total Disetujui"
                    value={summary.approved}
                    color="green"
                    icon={<img src={checkGreenIcon} width={24} alt="Success" />}
                />
            </Stack>

            <Card sx={{ borderRadius: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label={`Perlu Persetujuan (${loans.filter(l => l.status_pengajuan === 'pending_pengajuan').length})`} sx={{ fontWeight: 700, textTransform: 'none' }} />
                        <Tab label="Riwayat Pengajuan" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    </Tabs>
                </Box>
                <CardContent>
                    <Box sx={{ mx: -1 }}>
                        <LoanTable 
                            columns={leadColumns} 
                            data={filteredLoans} 
                            hideCard={true} 
                            emptyMessage="Tidak ada data permohonan pinjaman pada kategori ini."
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LeadLoanPage;

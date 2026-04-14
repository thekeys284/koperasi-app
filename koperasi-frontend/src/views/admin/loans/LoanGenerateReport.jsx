import React, { useState, useEffect } from "react";
import { 
    Box, 
    Typography,
    Breadcrumbs,
    Link,
    Grid,
    Card,
    CardContent,
    Stack,
    MenuItem,
    Select,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Divider,
    Avatar,
    Chip,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { 
    IconFileAnalytics, 
    IconCalendar, 
    IconUser, 
    IconBuildingBank, 
    IconReceipt2, 
    IconAlertCircle, 
    IconUsers,
    IconDownload,
    IconFileSpreadsheet,
    IconPdf
} from "@tabler/icons-react";

import api from "../../../api/axios";

export default function LoanGenerateReport() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_pinjaman: 0,
        total_terbayar: 0,
        total_sisa: 0,
        jumlah_peminjam: 0
    });

    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        user_id: "all",
        status: "all",
        jenis_pinjaman: "all"
    });

    const months = [
        { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
        { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
        { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
        { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data?.data || []);
            } catch (err) {
                console.error("Gagal mengambil data user:", err);
            }
        };
        fetchUsers();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await api.get("/loans/report/data", { params: filters });
            setReportData(response.data?.data || []);
            setSummary(response.data?.summary || {
                total_pinjaman: 0,
                total_terbayar: 0,
                total_sisa: 0,
                jumlah_peminjam: 0
            });
        } catch (err) {
            console.error("Gagal mengambil laporan:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

    const handleExportExcel = () => {
        if (reportData.length === 0) return;
        
        const headers = ["Nama Anggota", "Jenis Pinjaman", "Jumlah Pinjaman", "Tenor", "Cicilan per Bulan", "Total Terbayar", "Sisa Pinjaman", "Status"];
        const rows = reportData.map(item => [
            item.user_name,
            item.jenis_pinjaman,
            item.jumlah_pinjaman,
            `${item.tenor} Bulan`,
            item.cicilan_per_bulan,
            item.total_terbayar,
            item.sisa_pinjaman,
            item.status
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Pinjaman_${filters.month}_${filters.year}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link underline="hover" color="text.primary" sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                    Generate Laporan
                </Link>
            </Breadcrumbs>

            <Typography variant="h2" sx={{ fontWeight: 800, color: "primary.dark", mb: 0.5 }}>Generate Laporan Pinjaman</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Kelola dan analisis data pinjaman berdasarkan periode tertentu</Typography>

            {/* FILTER SECTION */}
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", mb: 4, border: "1px solid #e2e8f0" }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Filter Laporan</Typography>
                    <Grid container spacing={3} alignItems="flex-end">
                        <Grid item xs={12} sm={6} md={2}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Bulan</Typography>
                            <Select 
                                fullWidth size="small" 
                                value={filters.month}
                                onChange={(e) => setFilters({...filters, month: e.target.value})}
                                sx={{ borderRadius: "10px" }}
                            >
                                <MenuItem value="all">Semua</MenuItem>
                                {months.map(m => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Tahun</Typography>
                            <Select 
                                fullWidth size="small" 
                                value={filters.year}
                                onChange={(e) => setFilters({...filters, year: e.target.value})}
                                sx={{ borderRadius: "10px" }}
                            >
                                {years.map(y => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Anggota</Typography>
                            <Select 
                                fullWidth size="small" 
                                value={filters.user_id}
                                onChange={(e) => setFilters({...filters, user_id: e.target.value})}
                                sx={{ borderRadius: "10px" }}
                            >
                                <MenuItem value="all">Semua</MenuItem>
                                {users.map(u => (
                                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}>Status</Typography>
                            <Select 
                                fullWidth size="small" 
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                sx={{ borderRadius: "10px" }}
                            >
                                <MenuItem value="all">Semua</MenuItem>
                                <MenuItem value="aktif">Aktif</MenuItem>
                                <MenuItem value="paid">Lunas</MenuItem>
                                <MenuItem value="pending">Menunggu</MenuItem>
                                <MenuItem value="rejected">Ditolak</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button 
                                fullWidth variant="contained" 
                                onClick={fetchReport}
                                disabled={loading}
                                sx={{ 
                                    borderRadius: "10px", 
                                    py: 1, 
                                    textTransform: "none", 
                                    fontWeight: 700,
                                    bgcolor: "#2e7d32",
                                    "&:hover": { bgcolor: "#1b5e20" }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Laporan"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: "Total Pinjaman", value: formatCurrency(summary.total_pinjaman), icon: <IconBuildingBank size={24} />, color: "#e3f2fd", iconColor: "#1e88e5" },
                    { title: "Total Terbayar", value: formatCurrency(summary.total_terbayar), icon: <IconReceipt2 size={24} />, color: "#e8f5e9", iconColor: "#43a047" },
                    { title: "Sisa Pinjaman", value: formatCurrency(summary.total_sisa), icon: <IconAlertCircle size={24} />, color: "#fff3e0", iconColor: "#fb8c00" },
                    { title: "Jumlah Peminjam", value: `${summary.jumlah_peminjam} Orang`, icon: <IconUsers size={24} />, color: "#f3e5f5", iconColor: "#8e24aa" }
                ].map((card, idx) => (
                    <Grid item xs={12} sm={6} md={3} lg={3} key={idx} sx={{ display: 'flex' }}>
                        <Card sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "none", width: '100%', display: 'flex', alignItems: 'center' }}>
                            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, width: '100%' }}>
                                <Avatar sx={{ bgcolor: card.color, color: card.iconColor, width: 48, height: 48 }}>
                                    {card.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{card.title}</Typography>
                                    <Typography variant="h3" fontWeight={800}>{card.value}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* TABLE SECTION */}
            <Card sx={{bgcolor:"success", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}>
                <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                    <Typography variant="h4" fontWeight={700}>Tabel Rincian</Typography>
                    <Stack direction="row" spacing={2}>
                        <Button 
                            variant="outlined" color="success"
                            startIcon={<IconFileSpreadsheet size={18} />}
                            onClick={handleExportExcel}
                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
                        >
                            Export Excel
                        </Button>
                    </Stack>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Nama Anggota</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Jenis</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Jumlah</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Tenor</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Cicilan</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Terbayar</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Sisa</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length > 0 ? reportData.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.user_name}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.jenis_pinjaman} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: row.jenis_pinjaman === 'Produktif' ? '#eff6ff' : '#f5f3ff',
                                                color: row.jenis_pinjaman === 'Produktif' ? '#2563eb' : '#7c3aed',
                                                fontWeight: 800,
                                                fontSize: "12px"
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(row.jumlah_pinjaman)}</TableCell>
                                    <TableCell>{row.tenor} Bulan</TableCell>
                                    <TableCell>{formatCurrency(row.cicilan_per_bulan)}</TableCell>
                                    <TableCell sx={{ color: "success.main", fontWeight: 600 }}>{formatCurrency(row.total_terbayar)}</TableCell>
                                    <TableCell sx={{ color: "error.main", fontWeight: 700 }}>{formatCurrency(row.sisa_pinjaman)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status.toUpperCase()} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: row.status === 'aktif' ? '#dcfce7' : (row.status === 'lunas' ? '#eff6ff' : '#fef3c7'),
                                                color: row.status === 'aktif' ? '#16a34a' : (row.status === 'lunas' ? '#2563eb' : '#d97706'),
                                                fontWeight: 800,
                                                fontSize: "10px"
                                            }} 
                                        />
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <IconFileAnalytics size={48} color="#94a3b8" />
                                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                            Tidak ada data pinjaman yang ditemukan untuk periode ini.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Silakan sesuaikan filter dan klik "Generate Laporan".
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "../../../utils/format";
import { 
    Box, 
    Typography,
    Breadcrumbs,
    Link,
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
} from "@tabler/icons-react";

import api from "../../../api/axios";
import * as XLSX from "xlsx";

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
                const response = await api.get("/loans/filter-members");
                // Menghandle kemungkinan data dibungkus atau tidak
                const rawData = response.data?.data || response.data || [];
                setUsers(rawData);
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

    const handleExportExcel = () => {
        if (reportData.length === 0) return;
        
        const worksheetData = reportData.map(item => ({
            "Nama User": item.user_name,
            "Tanggal Dimulai": item.tanggal_mulai_cicilan || "-",
            "Mode": item.loan_mode_label,
            "Jenis": item.jenis_pinjaman,
            "Total Pinjaman": formatCurrency(item.jumlah_pinjaman),
            "Tenor": `${item.tenor} Bulan`,
            "Cicilan/Bulan": formatCurrency(item.cicilan_per_bulan),
            "Terbayar": formatCurrency(item.total_terbayar),
            "Sisa Pinjaman": formatCurrency(item.sisa_pinjaman),
            "Sisa Cicilan": item.sisa_cicilan,
            "Total Cicilan": item.total_cicilan,
            "Status": item.status_label || item.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pinjaman");

        // Generate file name
        const fileName = `Laporan_Pinjaman_${filters.month}_${filters.year}.xlsx`;

        // Export to file
        XLSX.writeFile(workbook, fileName);
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
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            alignItems: "flex-end"
                        }}
                    >
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 160px" } }}>
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
                        </Box>
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 160px" } }}>
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
                        </Box>
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "3 1 220px" } }}>
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
                        </Box>
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "3 1 220px" } }}>
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
                        </Box>
                        <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 180px" } }}>
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
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box
                sx={{
                    mb: 4,
                    // border: "2px solid black",
                    display: "flex",
                    gap: 2,
                    flexWrap: "nowrap",
                    overflow: "hidden"
                }}
            >
                {[
                    { title: "Total Pinjaman", value: formatCurrency(summary.total_pinjaman), icon: <IconBuildingBank size={24} />, color: "#e3f2fd", iconColor: "#1e88e5" },
                    { title: "Total Terbayar", value: formatCurrency(summary.total_terbayar), icon: <IconReceipt2 size={24} />, color: "#e8f5e9", iconColor: "#43a047" },
                    { title: "Sisa Pinjaman", value: formatCurrency(summary.total_sisa), icon: <IconAlertCircle size={24} />, color: "#fff3e0", iconColor: "#fb8c00" },
                    { title: "Jumlah Peminjam", value: `${summary.jumlah_peminjam} Orang`, icon: <IconUsers size={24} />, color: "#f3e5f5", iconColor: "#8e24aa" }
                ].map((card, idx, arr) => (
                    <Box key={idx} sx={{ display: "flex", flex: 1, minWidth: 0 }}>
                        <Card sx={{ 
                            borderRadius: 4,
                            border: "none",
                            borderRight: idx !== arr.length - 1 ? "1px solid #e2e8f0" : "none",
                            boxShadow: "none",
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center',
                            transition: "all 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                transform: "translateY(-2px)"
                            }
                        }}>
                            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, width: '100%' }}>
                                <Avatar sx={{ 
                                    bgcolor: card.color, 
                                    color: card.iconColor, 
                                    width: 56, 
                                    height: 56 
                                }}>
                                    {card.icon}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{card.title}</Typography>
                                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{card.value}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

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
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Nama User</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Tanggal Dimulai</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Mode</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Jenis</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Total Pinjaman</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Tenor</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Cicilan/Bulan</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Terbayar</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Sisa Pinjaman</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: "#64748b" }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length > 0 ? reportData.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.user_name}</TableCell>
                                    <TableCell>{formatDate(row.tanggal_mulai_cicilan)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.loan_mode_label} 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ 
                                                bgcolor: row.loan_mode === 'topup' ? '#FEE2E2' : '#E0F2FE',
                                                color: row.loan_mode === 'topup' ? '#B91C1C' : '#075985',
                                                fontWeight: 700,
                                                fontSize: "11px",
                                                textTransform: "uppercase"
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.jenis_pinjaman} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: row.jenis_pinjaman === 'Produktif' ? '#DBEAFE' : '#F3E8FF',
                                                color: row.jenis_pinjaman === 'Produktif' ? '#2563EB' : '#9333EA',
                                                fontWeight: 600,
                                                fontSize: "12px",
                                                textTransform: "uppercase"
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(row.jumlah_pinjaman)}</TableCell>
                                    <TableCell>{row.tenor} Bulan</TableCell>
                                    <TableCell>{formatCurrency(row.cicilan_per_bulan)}</TableCell>
                                    <TableCell sx={{ color: "success.main", fontWeight: 600 }}>{formatCurrency(row.total_terbayar)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: "error.main", fontWeight: 700 }}>
                                            {formatCurrency(row.sisa_pinjaman)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "10px" }}>
                                            Sisa {row.sisa_cicilan} dari {row.total_cicilan} cicilan
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status_label || row.status} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor:
                                                    row.status === 'aktif'
                                                        ? '#dcfce7'
                                                        : row.status === 'lunas'
                                                            ? '#eff6ff'
                                                            : row.status === 'rejected'
                                                                ? '#fee2e2'
                                                                : '#fef3c7',
                                                color:
                                                    row.status === 'aktif'
                                                        ? '#16a34a'
                                                        : row.status === 'lunas'
                                                            ? '#2563eb'
                                                            : row.status === 'rejected'
                                                                ? '#b91c1c'
                                                                : '#d97706',
                                                fontWeight: 800,
                                                fontSize: "10px",
                                                textTransform: "none"
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

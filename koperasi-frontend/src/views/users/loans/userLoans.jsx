import React from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    IconButton,
    Breadcrumbs,
    Link,
    LinearProgress
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";

const StatusBadge = ({ status }) => {
    const config = {
        approved: {
            label: "Disetujui Ketua",
            bg: "#DCFCE7",
            color: "#16A34A",
        },
        lunas: {
            label: "Lunas",
            bg: "#DBEAFE",
            color: "#2563EB",
        },
        rejected: {
            label: "Ditolak",
            bg: "#FEE2E2",
            color: "#DC2626",
        },
    };

    const item = config[status];

    return (
        <Chip
            label={item.label}
            sx={{
                background: item.bg,
                color: item.color,
                fontWeight: 600,
            }}
            size="small"
        />
    );
};

const LoanTypeBadge = ({ type }) => {
    const config = {
        konsumtif: { bg: "#F3E8FF", color: "#9333EA" },
        produktif: { bg: "#DBEAFE", color: "#2563EB" },
    };

    return (
        <Chip
            label={type}
            size="small"
            sx={{
                background: config[type].bg,
                color: config[type].color,
                fontWeight: 600,
                textTransform: "uppercase",
            }}
        />
    );
};

const UserLoans = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 4, background: "#F5F7FB", minHeight: "100vh" }}>

            {/* BREADCRUMB */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1 }}
            >
                <Link underline="hover" color="text.primary">
                    Pinjaman
                </Link>
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
                mb={4}
            >
                <Typography variant="h4" fontWeight={800}>
                    ID Pinjam: #PJM-2023001
                </Typography>

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

            {/* STAT CARDS */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4} width="100%">
                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
                        <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                            Total Pinjaman Pokok
                        </Typography>
                        <Typography fontSize={28} fontWeight={800} color="#2563EB">
                            Rp 5.000.000
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
                    <CardContent>
                        <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
                            Total Terbayar
                        </Typography>
                        <Typography fontSize={28} fontWeight={800} color="#16A34A">
                            Rp 2.000.000
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={40}
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
                            Rp 3.000.000
                        </Typography>
                        <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block", mt: 1 }}>
                            3 dari 5 cicilan tersisa
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* TABLE */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography fontWeight={700}>
                            Daftar Pengajuan
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            {/* <Button
                                startIcon={<FilterListIcon />}
                                variant="outlined"
                            >
                                Filter
                            </Button> */}

                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={() => navigate("/user/loans/add")}
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
                                Pengajuan Baru
                            </Button>
                        </Stack>
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
                                        }
                                    }}
                                >
                                    <TableCell>ID & TGL PENGAJUAN</TableCell>
                                    <TableCell>JENIS & JUMLAH</TableCell>
                                    <TableCell>TENOR</TableCell>
                                    <TableCell>STATUS</TableCell>
                                    <TableCell>ACC KETUA</TableCell>
                                    <TableCell>DETAIL</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>

                                <TableRow>
                                    <TableCell>
                                        <Typography fontWeight={700} color="primary">
                                            #PJ-2023-002
                                        </Typography>
                                        <Typography fontSize={12} color="text.secondary">
                                            10 Okt 2023
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <LoanTypeBadge type="konsumtif" />

                                        <Typography fontWeight={700}>
                                            Rp 5.000.000
                                        </Typography>
                                    </TableCell>

                                    <TableCell>5 Bulan</TableCell>

                                    <TableCell>
                                        <StatusBadge status="approved" />
                                    </TableCell>

                                    <TableCell>
                                        <Typography fontSize={12}>
                                            11 Okt / 12 Okt
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <IconButton onClick={() => navigate("/user/loans/cicilan")}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>
                                        <Typography fontWeight={700} color="primary">
                                            #PJ-2023-001
                                        </Typography>
                                        <Typography fontSize={12} color="text.secondary">
                                            01 Sep 2023
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <LoanTypeBadge type="konsumtif" />
                                        <Typography fontWeight={700}>
                                            Rp 3.000.000
                                        </Typography>
                                    </TableCell>

                                    <TableCell>6 Bulan</TableCell>

                                    <TableCell>
                                        <StatusBadge status="lunas" />
                                    </TableCell>

                                    <TableCell>
                                        <Typography fontSize={12}>
                                            11 Okt / 12 Okt
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <IconButton onClick={() => navigate("/user/loans/cicilan")}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </Box>

                </CardContent>
            </Card>

        </Box>
    );
};

export default UserLoans;
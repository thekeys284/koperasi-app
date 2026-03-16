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

                <Button variant="contained">
                    Cetak Rekap
                </Button>
            </Stack>

            {/* STAT CARDS */}
            <Stack direction="row" spacing={3} mb={4}>

                <Card sx={{ flex: 1, borderRadius: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary">
                            Total Pinjaman Pokok
                        </Typography>
                        <Typography fontWeight={800} fontSize={22} color="primary">
                            Rp 5.000.000
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary">
                            Total Terbayar
                        </Typography>

                        <Typography fontWeight={800} fontSize={22} color="#16A34A">
                            Rp 2.000.000
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={40}
                            sx={{ mt: 2, borderRadius: 2 }}
                        />
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, borderRadius: 3 }}>
                    <CardContent>
                        <Typography color="text.secondary">
                            Sisa Pinjaman
                        </Typography>

                        <Typography fontWeight={800} fontSize={22} color="#DC2626">
                            Rp 3.000.000
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
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
                            <Button
                                startIcon={<FilterListIcon />}
                                variant="outlined"
                            >
                                Filter
                            </Button>

                            <Button
                                startIcon={<AddIcon />}
                                variant="contained"
                                onClick={() => navigate("/user/loans/add")}
                            >
                                Pengajuan Baru
                            </Button>
                        </Stack>
                    </Stack>

                    <Table>

                        <TableHead>
                            <TableRow
                                sx={{
                                    background: "#F3F4F6",
                                    "& .MuiTableCell-head": {
                                        fontWeight: 700,
                                        fontSize: 12,
                                        color: "#64748B"
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

                                <TableCell>✓ ✓</TableCell>

                                <TableCell>
                                    <IconButton onClick={() => navigate("/user/loans/cicilan")}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>

                </CardContent>
            </Card>

        </Box>
    );
};

export default UserLoans;
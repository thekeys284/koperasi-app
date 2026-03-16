import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Stack,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    LinearProgress,
    Breadcrumbs,
    Link,
    IconButton,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import PostponeInstallmentModal from "../../../ui-component/cards/Loans/User/userTundaCicilan";

const StatusChip = ({ status }) => {
    const config = {
        paid: {
            label: "Sudah Bayar",
            bg: "#DCFCE7",
            color: "#16A34A",
        },
        unpaid: {
            label: "Belum Bayar",
            bg: "#FEF3C7",
            color: "#F59E0B",
        },
        locked: {
            label: "Terkunci",
            bg: "#E5E7EB",
            color: "#6B7280",
        },
    };

    const item = config[status];

    return (
        <Chip
            label={item.label}
            size="small"
            sx={{
                background: item.bg,
                color: item.color,
                fontWeight: 600,
            }}
        />
    );
};

const UserCicilan = () => {
    const navigate = useNavigate();
    const [openPostpone, setOpenPostpone] = useState(false);

    return (
        <Box sx={{ p: 4, background: "#F5F7FB", minHeight: "100vh" }}>

            {/* BREADCRUMB */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 1 }}
            >
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate("/user/loans")}
                    sx={{ cursor: "pointer" }}
                >
                    Pinjaman
                </Link>
                <Typography color="text.primary">Cicilan</Typography>
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
                mb={3}
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

            {/* INFORMASI PINJAMAN */}
            <Card sx={{ borderRadius: 3, mb: 4 }}>
                <CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                    >
                        <Typography fontWeight={700}>
                            Informasi Pinjaman
                        </Typography>

                        <Chip
                            label="KONSUMTIF"
                            size="small"
                            sx={{
                                background: "#F3E8FF",
                                color: "#9333EA",
                                fontWeight: 700,
                            }}
                        />
                    </Stack>

                    <Stack spacing={2}>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Jenis Pinjaman
                            </Typography>
                            <Typography>Konsumtif</Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Jumlah Pinjaman
                            </Typography>
                            <Typography>Rp 5.000.000</Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Tenor
                            </Typography>
                            <Typography>5 Bulan</Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Tgl Potong
                            </Typography>
                            <Typography>12 Okt 2023</Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography color="text.secondary">
                                Tgl Pengajuan
                            </Typography>
                            <Typography>10 Okt 2023</Typography>
                        </Stack>

                    </Stack>

                </CardContent>
            </Card>

            {/* JADWAL CICILAN */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography fontWeight={700}>
                            Jadwal Pembayaran Cicilan
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        background: "#16A34A",
                                        borderRadius: "50%",
                                    }}
                                />
                                <Typography fontSize={12}>
                                    Sudah Bayar
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        background: "#F59E0B",
                                        borderRadius: "50%",
                                    }}
                                />
                                <Typography fontSize={12}>
                                    Belum Bayar
                                </Typography>
                            </Stack>
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
                                        color: "#64748B",
                                    },
                                }}
                            >
                                <TableCell>ID CICILAN</TableCell>
                                <TableCell>CICILAN KE-</TableCell>
                                <TableCell>TANGGAL JATUH TEMPO</TableCell>
                                <TableCell>NOMINAL</TableCell>
                                <TableCell>STATUS</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            <TableRow>
                                <TableCell>#CIC-2001</TableCell>
                                <TableCell>1</TableCell>
                                <TableCell>12 Okt 2023</TableCell>
                                <TableCell>Rp 1.000.000</TableCell>
                                <TableCell>
                                    <StatusChip status="paid" />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>#CIC-2002</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>12 Nov 2023</TableCell>
                                <TableCell>Rp 1.000.000</TableCell>
                                <TableCell>
                                    <StatusChip status="paid" />
                                </TableCell>
                            </TableRow>

                            <TableRow sx={{ background: "#F9FAFB" }}>
                                <TableCell>#CIC-2003</TableCell>
                                <TableCell>3</TableCell>
                                <TableCell>12 Des 2023</TableCell>
                                <TableCell>Rp 1.000.000</TableCell>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <StatusChip status="unpaid" />
                                        <IconButton size="small" onClick={() => setOpenPostpone(true)}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>#CIC-2004</TableCell>
                                <TableCell>4</TableCell>
                                <TableCell>12 Jan 2024</TableCell>
                                <TableCell>Rp 1.000.000</TableCell>
                                <TableCell>
                                    <StatusChip status="locked" />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>#CIC-2005</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>12 Feb 2024</TableCell>
                                <TableCell>Rp 1.000.000</TableCell>
                                <TableCell>
                                    <StatusChip status="locked" />
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>

                </CardContent>
            </Card>

            <PostponeInstallmentModal
                open={openPostpone}
                handleClose={() => setOpenPostpone(false)}
            />
        </Box>
    );
};

export default UserCicilan;
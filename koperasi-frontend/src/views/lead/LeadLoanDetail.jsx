import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
    Avatar,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';

import {
    IconUser,
    IconFileText,
    IconShieldCheck,
    IconCalendar,
    IconCircleCheck,
    IconCircleX,
    IconDots,
    IconLock,
    IconWallet,
    IconInfoCircle,
    IconArrowLeft,
    IconX,
    IconEdit
} from '@tabler/icons-react';

const LeadLoanDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openReject, setOpenReject] = React.useState(false);
    const [reason, setReason] = React.useState('');

    const handleOpenReject = () => setOpenReject(true);
    const handleCloseReject = () => setOpenReject(false);
    const handleSendReject = () => {
        console.log('Rejected with reason:', reason);
        handleCloseReject();
    };

    const loanData = {
        id: 'PJ-9981-2023',
        anggota: 'Budi Santoso',
        id_anggota: 'AG-2023-0045',
        unit_kerja: 'Biro SDM',
        gaji_pokok: 'Rp 4.500.000',
        jenis: 'PRODUKTIF',
        jumlah: 'Rp 15.000.000',
        tenor: '12 Bulan',
        tanggal: '22 Oktober 2023',
        bulan_potongan: 'Maret 2024',
        status: 'Menunggu Persetujuan Ketua 1',
        update_at: '24 Okt 2023, 14:20'
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            {/* BACK BUTTON */}
            <Box sx={{ mb: 2 }}>
                <Button
                    startIcon={<IconArrowLeft size="1rem" />}
                    onClick={() => navigate('/lead/loans')}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'transparent', color: 'gray.300' }
                    }}
                >
                    Kembali
                </Button>
            </Box>

            {/* STATUS HEADER */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#FFF8E1', color: '#FFB300', width: 44, height: 44 }}>
                        <IconWallet size="1.3rem" />
                    </Avatar>

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            STATUS SAAT INI
                        </Typography>

                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A237E' }}>
                            {loanData.status}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        bgcolor: '#F5F6FA',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <IconCalendar size="1rem" />
                    <Typography variant="caption">
                        Update: {loanData.update_at}
                    </Typography>
                </Box>
            </Paper>

            {/* MAIN LAYOUT */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '2fr 1fr'
                    },
                    gap: 3
                }}
            >
                {/* LEFT COLUMN */}
                <Stack spacing={3}>

                    {/* INFORMASI ANGGOTA */}
                    <MainCard
                        content={false}
                        title={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconUser size="1.1rem" />
                                <Typography variant="h4">Informasi Anggota</Typography>
                            </Stack>
                        }
                    >
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 3
                                }}
                            >
                                <Box>
                                    <Typography variant="caption">Nama Lengkap</Typography>
                                    <Typography variant="h4">{loanData.anggota}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">ID Anggota</Typography>
                                    <Typography variant="h4">{loanData.id_anggota}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Unit Kerja</Typography>
                                    <Typography variant="h4">{loanData.unit_kerja}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Gaji Pokok</Typography>
                                    <Typography variant="h4">{loanData.gaji_pokok}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </MainCard>

                    {/* DETAIL PINJAMAN */}
                    <MainCard
                        content={false}
                        title={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconFileText size="1.1rem" />
                                <Typography variant="h4">Detail Pinjaman</Typography>
                            </Stack>
                        }
                    >
                        <CardContent>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 3,
                                    mb: 3
                                }}
                            >
                                <Box>
                                    <Typography variant="caption">ID Pinjam</Typography>
                                    <Typography variant="h4">{loanData.id}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Jenis Pinjaman</Typography>
                                    <br />
                                    <Chip
                                        label={loanData.jenis}
                                        size="small"
                                        sx={{
                                            bgcolor: '#E3F2FD',
                                            color: '#1976D2',
                                            fontWeight: 900
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption">Jumlah Pinjaman</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {loanData.jumlah}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Tenor</Typography>
                                    <Typography variant="h4">{loanData.tenor}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Tanggal Pengajuan</Typography>
                                    <Typography variant="h4">{loanData.tanggal}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption">Potong Gaji</Typography>
                                    <Typography variant="h4">{loanData.bulan_potongan}</Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    bgcolor: '#F1F8FE',
                                    p: 2,
                                    borderRadius: 2,
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'center'
                                }}
                            >
                                <IconInfoCircle size="1.1rem" />
                                <Typography variant="body2">
                                    Pinjaman menggunakan bunga 0% sesuai kebijakan koperasi.
                                </Typography>
                            </Box>
                        </CardContent>
                    </MainCard>
                </Stack>

                {/* RIGHT COLUMN */}
                <MainCard
                    content={false}
                    title={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <IconShieldCheck size="1.1rem" />
                            <Typography variant="h4">Aksi Persetujuan</Typography>
                        </Stack>
                    }
                >
                    <CardContent>

                        {/* PENINJAU */}
                        <Box sx={{ bgcolor: '#F5F6FA', p: 2, borderRadius: 2, mb: 3 }}>
                            <Typography variant="caption">
                                PENINJAU SAAT INI
                            </Typography>

                            <Stack direction="row" spacing={2} mt={1}>
                                <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }}>
                                    <IconUser size="1rem" />
                                </Avatar>

                                <Box>
                                    <Typography fontWeight={700}>
                                        Bpk. Heru Wijaya
                                    </Typography>
                                    <Typography variant="caption">
                                        Ketua 1 Koperasi
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* BUTTON */}
                        <Stack spacing={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<IconCircleCheck size="1rem" />}
                                sx={{
                                    bgcolor: '#1A237E',
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Setujui Pengajuan
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                onClick={handleOpenReject}
                                startIcon={<IconCircleX size="1rem" />}
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Tolak Pengajuan
                            </Button>
                        </Stack>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="caption" fontWeight={700}>
                            ALUR PENGAJUAN
                        </Typography>

                        <Stack spacing={3} mt={2}>
                            <Stack direction="row" spacing={2}>
                                <Avatar sx={{ bgcolor: '#4CAF50' }}>
                                    <IconCircleCheck size="1rem" />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700}>
                                        Admin Verifikasi
                                    </Typography>
                                    <Typography variant="caption">
                                        Selesai
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Avatar sx={{ bgcolor: '#1A237E' }}>
                                    <IconDots size="1rem" />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700} color="#1A237E">
                                        Ketua 1
                                    </Typography>
                                    <Typography variant="caption">
                                        Sedang berjalan
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Avatar sx={{ bgcolor: '#ECEFF1', color: '#9E9E9E' }}>
                                    <IconLock size="1rem" />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700} color="#9E9E9E">
                                        Ketua 2
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>

                    </CardContent>
                </MainCard>
            </Box>

            {/* REJECT DIALOG */}
            <Dialog
                open={openReject}
                onClose={handleCloseReject}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconEdit size="24px" color="#475569" />
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#334155' }}>
                            Detail Penolakan Pengajuan
                        </Typography>
                    </Stack>
                    <IconButton onClick={handleCloseReject} sx={{ color: '#94A3B8' }}>
                        <IconX size="24px" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700, color: '#475569' }}>
                        Alasan Penolakan Pengajuan Pinjaman
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Tambahkan Teks"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                bgcolor: '#ffffff',
                                '& fieldset': { borderColor: '#E2E8F0' },
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseReject}
                        sx={{
                            borderRadius: '24px',
                            px: 4,
                            py: 1.2,
                            bgcolor: '#E2E8F0',
                            color: '#475569',
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#CBD5E1' }
                        }}
                    >
                        Lewati
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSendReject}
                        sx={{
                            borderRadius: '24px',
                            px: 5,
                            py: 1.2,
                            bgcolor: '#1947BA',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(25, 71, 186, 0.2)',
                            '&:hover': { bgcolor: '#153a9e' }
                        }}
                    >
                        Kirim
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeadLoanDetailPage;
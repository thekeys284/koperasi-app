import React from "react";
import {
    Box,
    Grid,
    Typography,
    Stack,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    MenuItem,
    Select,
    Button,
    InputAdornment,
    Paper
} from "@mui/material";

import MainCard from "ui-component/cards/MainCard";
import {
    IconFileDescription,
    IconLock,
    IconInfoCircle,
    IconChevronDown,
    IconPaperclip
} from "@tabler/icons-react";

const LeadLoanCreatePage = () => {
    const [tipePinjaman, setTipePinjaman] = React.useState("produktif");
    const [fileName, setFileName] = React.useState("");
    const fileInputRef = React.useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 3, md: 5 },
                maxWidth: 1600,
                mx: "auto",
                minHeight: "100vh"
            }}
        >
            {/* HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h2" fontWeight={800}> Pengajuan Pinjaman Baru </Typography>
                <Typography color="#64748b" fontSize={16} mt={1}> Silakan lengkapi rincian pengajuan pinjaman Anda untuk proses verifikasi otomatis. </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* FORM */}
                <Grid item xs={12} md={7}>
                    <MainCard
                        title={
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <IconFileDescription size="1.4rem" color="#2563eb" />
                                <Typography variant="h3" fontWeight={700}>
                                    Detail Pengajuan
                                </Typography>
                            </Stack>
                        }
                    >
                        <Stack spacing={4}>
                            {/* TIPE PINJAMAN */}
                            <Box>
                                <Typography fontWeight={600} fontSize={16} mb={1}>
                                    Tipe Pinjaman
                                </Typography>

                                <RadioGroup
                                    row
                                    value={tipePinjaman}
                                    onChange={(e) => setTipePinjaman(e.target.value)}
                                >
                                    <FormControlLabel value="produktif" control={<Radio />} label="Produktif" />
                                    <FormControlLabel value="konsumtif" control={<Radio />} label="Konsumtif" />
                                </RadioGroup>
                            </Box>

                            {/* UPLOAD */}
                            {tipePinjaman === "konsumtif" && (
                                <Box>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                    <TextField
                                        fullWidth
                                        size="medium"
                                        value={fileName}
                                        placeholder="Upload nota pembelian"
                                        onClick={() => fileInputRef.current.click()}
                                        InputProps={{
                                            readOnly: true,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconPaperclip size="1.1rem" />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                height: 52,
                                                cursor: 'pointer',
                                                '& input': { cursor: 'pointer' }
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* JUMLAH */}
                            <TextField
                                fullWidth
                                size="medium"
                                label="Jumlah Pinjaman"
                                placeholder="0"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">Rp</InputAdornment>
                                    ),
                                    sx: { height: 52 }
                                }}
                            />

                            {/* TENOR + POTONG GAJI */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Select
                                        fullWidth
                                        defaultValue="3"
                                        IconComponent={IconChevronDown}
                                        sx={{ height: 52 }}
                                    >
                                        <MenuItem value="3">3 Bulan</MenuItem>
                                        <MenuItem value="6">6 Bulan</MenuItem>
                                        <MenuItem value="12">12 Bulan</MenuItem>
                                    </Select>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Mulai Potong Gaji"
                                        type="month"
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            sx: { height: 52 }
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            {/* KETERANGAN */}
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Keterangan pengajuan"
                            />

                            {/* BUTTON */}
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 3,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: 16
                                }}
                            >
                                Ajukan Pinjaman
                            </Button>
                        </Stack>
                    </MainCard>
                </Grid>

                {/* SUMMARY */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={4}>

                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h4" fontWeight={700} mb={2}>
                                Ringkasan Pinjaman
                            </Typography>

                            <Typography fontSize={36} fontWeight={800} color="#1d4ed8">
                                Rp 0
                            </Typography>

                            <Box mt={3}>
                                <Typography fontSize={14} color="#64748b">
                                    Estimasi Cicilan / Bulan
                                </Typography>
                                <Typography fontSize={18} fontWeight={700}>
                                    Rp 0 / 0 bulan
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} mt={3}>
                                <IconLock size="1.1rem" />
                                <Typography fontSize={13} color="#64748b">
                                    Proses pengajuan aman dan terenkripsi
                                </Typography>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#eff6ff" }}>
                            <Stack direction="row" spacing={2}>
                                <IconInfoCircle size="1.4rem" color="#2563eb" />
                                <Typography fontSize={14} color="#1e40af">
                                    Persetujuan pinjaman akan melewati persetujuan ketua koperasi.
                                </Typography>
                            </Stack>
                        </Paper>

                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LeadLoanCreatePage;
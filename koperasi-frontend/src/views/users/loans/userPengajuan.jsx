import React from "react";
import { useNavigate } from "react-router-dom";
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
    Paper,
    Breadcrumbs,
    Link,
    Alert,
    Snackbar
} from "@mui/material";
import api from "../../../api/axios";

import {
    IconFileDescription,
    IconPaperclip,
    IconChevronDown,
    IconLock,
    IconInfoCircle
} from "@tabler/icons-react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const formatRupiah = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
};

const cardSx = {
    p: { xs: 2.5, sm: 3, md: 4 },
    borderRadius: "20px",
    bgcolor: "background.paper",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)",
    width: "100%",
    boxSizing: "border-box"
};

const LeadLoanCreatePage = () => {
    const navigate = useNavigate();
    const [tipePinjaman, setTipePinjaman] = React.useState("konsumtif");
    const [jumlah, setJumlah] = React.useState(0);
    const [tenor, setTenor] = React.useState(3);
    const [cicilan, setCicilan] = React.useState(0);
    const [fileName, setFileName] = React.useState("");
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [bulanPotongGaji, setBulanPotongGaji] = React.useState("");
    const [keterangan, setKeterangan] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [successOpen, setSuccessOpen] = React.useState(false);
    const fileRef = React.useRef();

    React.useEffect(() => {
        if (jumlah && tenor) {
            setCicilan(Math.ceil(jumlah / tenor));
        } else {
            setCicilan(0);
        }
    }, [jumlah, tenor]);

    const handleJumlah = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setJumlah(Number(raw));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setErrorMessage("");

            const payload = new FormData();
            payload.append("user_id", "10");
            payload.append("type", tipePinjaman === "produktif" ? "Produktif" : "Konsumtif");
            payload.append("amount_requested", String(jumlah));
            payload.append("tenor_months", String(tenor));
            payload.append("bulan_potong_gaji", bulanPotongGaji || "");
            payload.append("reason", keterangan || "");

            if (selectedFile) {
                payload.append("document", selectedFile);
            }

            await api.post("/loans", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccessOpen(true);
            setKeterangan("");
            setJumlah(0);
            setTenor(3);
            setBulanPotongGaji("");
            setSelectedFile(null);
            setFileName("");

            setTimeout(() => {
                navigate("/user/loans");
            }, 700);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors && typeof errors === "object") {
                const firstError = Object.values(errors)[0];
                setErrorMessage(Array.isArray(firstError) ? firstError[0] : "Validasi gagal.");
            } else {
                setErrorMessage(err.response?.data?.message || "Gagal mengirim pengajuan pinjaman.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const tenorLabel = jumlah > 0 ? tenor : 0;

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                pl: { xs: 2, sm: 3, md: 4, lg: 5 }
            }}
        >
            {/* BREADCRUMB */}
            <Breadcrumbs
                aria-label="breadcrumb"
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 2 }}
            >
                <Link
                    underline="hover"
                    color="text.primary"
                    onClick={() => navigate("/user/loans")}
                    sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                    Pinjaman
                </Link>
                <Typography color="text.primary">Pengajuan Pinjaman</Typography>
            </Breadcrumbs>

            <Typography
                component="h1"
                sx={{
                    fontSize: { xs: 22, sm: 26, md: 28 },
                    fontWeight: 800,
                    color: "primary.dark",
                    letterSpacing: "-0.02em"
                }}
            >
                Pengajuan Pinjaman Baru
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: { xs: 3, md: 4 }, maxWidth: 720 }}>
                Silakan lengkapi rincian pengajuan pinjaman Anda untuk proses verifikasi otomatis.
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">

                {/* LEFT: form + kebijakan */}
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                    <Stack spacing={2.5} sx={{ width: "100%" }}>
                        <Paper sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <IconFileDescription size={22} color="#1976d2" />
                                    <Typography fontWeight={700} fontSize="1.05rem">
                                        Detail Pengajuan
                                    </Typography>
                                </Stack>

                                <Box>
                                    <Typography fontWeight={600} mb={1} fontSize={14}>
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

                                {tipePinjaman === "konsumtif" && (
                                    <Box>
                                        <Typography fontWeight={600} fontSize={14}>
                                            Kirim Bukti Nota Pinjaman Konsumtif
                                        </Typography>
                                        <Typography fontSize={13} color="text.secondary" mb={1}>
                                            Upload file nota pembelanjaan untuk tipe pinjaman konsumtif
                                        </Typography>

                                        <input hidden type="file" accept="image/*,.pdf" ref={fileRef} onChange={handleFile} />

                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={fileName}
                                            placeholder="Upload nota pembelian"
                                            onClick={() => fileRef.current?.click()}
                                            InputProps={{
                                                readOnly: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconPaperclip size={18} stroke={1.5} />
                                                    </InputAdornment>
                                                ),
                                                sx: { borderRadius: "12px" }
                                            }}
                                            sx={{ "& .MuiOutlinedInput-root": { cursor: "pointer" } }}
                                        />
                                    </Box>
                                )}

                                <Box>
                                    <Typography fontWeight={600} mb={1} fontSize={14}>
                                        Jumlah Pinjaman (IDR)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={formatRupiah(jumlah)}
                                        onChange={handleJumlah}
                                        placeholder="0"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">Rp</InputAdornment>
                                            ),
                                            sx: { borderRadius: "12px" }
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={2} justifyContent={"space-evenly"}>
                                    <Grid item size={6} xs={12} sm={6}>
                                        <Typography fontWeight={600} mb={1} fontSize={14}>
                                            Tenor (Bulan)
                                        </Typography>
                                        <Select
                                            fullWidth
                                            size="small"
                                            value={tenor}
                                            onChange={(e) => setTenor(Number(e.target.value))}
                                            IconComponent={IconChevronDown}
                                            sx={{ borderRadius: "12px" }}
                                        >
                                            <MenuItem value={3}>3 Bulan</MenuItem>
                                            <MenuItem value={6}>6 Bulan</MenuItem>
                                            <MenuItem value={12}>12 Bulan</MenuItem>
                                        </Select>
                                    </Grid>
                                    <Grid item size={6} xs={12} sm={6}>
                                        <Typography fontWeight={600} mb={1} fontSize={14}>
                                            Bulan Potong Gaji
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="month"
                                            value={bulanPotongGaji}
                                            onChange={(e) => setBulanPotongGaji(e.target.value)}
                                            placeholder="mm/yyyy"
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ sx: { borderRadius: "12px" } }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography fontWeight={600} mb={1} fontSize={14}>
                                        Keterangan Pengajuan
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Keterangan tambahan (opsional)"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        InputProps={{ sx: { borderRadius: "12px", alignItems: "flex-start" } }}
                                    />
                                </Box>

                                {errorMessage && (
                                    <Alert severity="error">{errorMessage}</Alert>
                                )}

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={submitting || !jumlah || !bulanPotongGaji}
                                    onClick={handleSubmit}
                                    sx={{
                                        py: 1.75,
                                        borderRadius: "12px",
                                        fontWeight: 700,
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        boxShadow: "0 4px 14px rgba(25, 118, 210, 0.35)"
                                    }}
                                >
                                    {submitting ? "Mengirim..." : "Ajukan Pinjaman"}
                                </Button>
                            </Stack>
                        </Paper>

                        <Alert
                            severity="info"
                            icon={<IconInfoCircle size={22} />}
                            sx={{
                                borderRadius: "16px",
                                bgcolor: "#e3f2fd",
                                color: "primary.dark",
                                alignItems: "flex-start",
                                "& .MuiAlert-message": { width: "100%" }
                            }}
                        >
                            <Typography fontWeight={700} fontSize={14} mb={1}>
                                Informasi Kebijakan
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" component="div" sx={{ lineHeight: 1.6 }}>
                                Pengajuan akan diverifikasi oleh tim koperasi sesuai ketentuan yang berlaku.
                                <br />
                                Pastikan dokumen dan nominal yang diisi sesuai dengan bukti transaksi.
                                <br />
                                Keputusan persetujuan mengacu pada saldo simpanan dan limit pinjaman anggota.
                            </Typography>
                        </Alert>
                    </Stack>
                </Grid>

                {/* RIGHT: ringkasan — tinggi mengikuti isi */}
                <Grid item xs={12} md={6} sx={{ display: "flex", alignSelf: "flex-start" }}>
                    <Paper sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                        <Typography fontWeight={700} fontSize="1.05rem" mb={2}>
                            Ringkasan Pinjaman
                        </Typography>

                        <Typography fontSize={11} fontWeight={600} color="text.secondary" letterSpacing={0.8}>
                            TOTAL PINJAMAN
                        </Typography>
                        <Typography fontSize={28} fontWeight={800} color="primary.main" sx={{ mt: 0.5, mb: 2 }}>
                            Rp {formatRupiah(jumlah)}
                        </Typography>

                        <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f1f5f9" }}>
                            <Typography fontSize={13} color="text.secondary">
                                Estimasi Cicilan / Bulan
                            </Typography>
                            <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                                Rp {formatRupiah(cicilan)} / {tenorLabel} bulan
                            </Typography>
                            {jumlah > 0 ? (
                                <Typography fontSize={12} color="text.secondary" mt={1.5} lineHeight={1.6} component="div">
                                    Pinjaman sebesar Rp {formatRupiah(jumlah)} dibagi {tenor} bulan,
                                    <br />
                                    sehingga cicilan sebesar Rp {formatRupiah(cicilan)} per bulan.
                                </Typography>
                            ) : (
                                <Typography fontSize={12} color="text.secondary" mt={1.5} lineHeight={1.6}>
                                    Masukkan jumlah pinjaman untuk melihat simulasi cicilan.
                                </Typography>
                            )}
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
                            <IconLock size={18} stroke={1.5} color="#64748b" />
                            <Typography fontSize={12} color="text.secondary">
                                Proses pengajuan aman dan terenkripsi
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={successOpen}
                autoHideDuration={2000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
                    Pengajuan pinjaman berhasil dikirim.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LeadLoanCreatePage;
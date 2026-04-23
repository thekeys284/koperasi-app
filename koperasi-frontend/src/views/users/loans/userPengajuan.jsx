import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Grid,
    Typography,
    Stack,
    TextField,
    MenuItem,
    Select,
    Button,
    InputAdornment,
    Paper,
    Breadcrumbs,
    Link,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from "@mui/material";
import api from "../../../api/axios";
import LoanFeedbackSnackbar from "../../../ui-component/feedback/LoanFeedbackSnackbar";

import {
    IconFileDescription,
    IconPaperclip,
    IconChevronDown,
    IconLock,
    IconInfoCircle,
    IconCircleX
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
    const location = useLocation();
    const navigate = useNavigate();
    const currentUserId = "10";
    const isTopupPage = location.pathname === "/user/loans/topup";
    const [tipePinjaman, setTipePinjaman] = React.useState("konsumtif");
    const [topupReferenceLoan, setTopupReferenceLoan] = React.useState(null);
    const [referenceLoading, setReferenceLoading] = React.useState(false);
    const [jumlah, setJumlah] = React.useState(0);
    const [tenor, setTenor] = React.useState(3);
    const [cicilan, setCicilan] = React.useState(0);
    const [fileName, setFileName] = React.useState("");
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [bulanPotongGaji, setBulanPotongGaji] = React.useState("");
    const [keterangan, setKeterangan] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [feedback, setFeedback] = React.useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState("");
    const fileRef = React.useRef();

    React.useEffect(() => {
        if (isTopupPage && topupReferenceLoan?.sisa_pinjaman) {
            // For topup: total = remaining installments + new topup amount
            const sisaLama = Number(topupReferenceLoan.sisa_pinjaman || 0);
            const totalBaru = sisaLama + Number(jumlah);
            setCicilan(tenor > 0 ? Math.ceil(totalBaru / tenor) : 0);
        } else if (jumlah && tenor) {
            // For new loan: just divide by tenor
            setCicilan(Math.ceil(jumlah / tenor));
        } else {
            setCicilan(0);
        }
    }, [jumlah, tenor, isTopupPage, topupReferenceLoan]);

    React.useEffect(() => {
        let active = true;

        if (!isTopupPage) {
            setTopupReferenceLoan(null);
            setReferenceLoading(false);
            return () => {
                active = false;
            };
        }

        const fetchReferenceLoans = async () => {
            try {
                setReferenceLoading(true);
                const response = await api.get("/loans", {
                    params: {
                        user_id: currentUserId,
                    },
                });

                const rows = Array.isArray(response.data?.data) ? response.data.data : [];
                const eligible = rows
                .filter((item) => {
                    const status = String(item?.status_pengajuan || "").toLowerCase();
                    return ["disetujui_ketua", "aktif", "paid"].includes(status);
                })
                .sort((a, b) => {
                    const aDate = new Date(a?.tgl_acc_ketua || a?.created_at || 0).getTime();
                    const bDate = new Date(b?.tgl_acc_ketua || b?.created_at || 0).getTime();
                    return bDate - aDate;
                });

                if (active) {
                    setTopupReferenceLoan(eligible[0] || null);
                }
            } catch (err) {
                if (active) {
                    setTopupReferenceLoan(null);
                }
            } finally {
                if (active) {
                    setReferenceLoading(false);
                }
            }
        };

        fetchReferenceLoans();

        return () => {
            active = false;
        };
    }, [currentUserId, isTopupPage]);

    React.useEffect(() => {
        if (!isTopupPage) {
            return;
        }

        if (topupReferenceLoan?.next_topup_month) {
            setBulanPotongGaji(topupReferenceLoan.next_topup_month);
        }
    }, [isTopupPage, topupReferenceLoan]);

    const handleJumlah = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setJumlah(Number(raw));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation: Max 2MB
            if (file.size > 2 * 1024 * 1024) {
                setErrorMessage("Ukuran file maksimal adalah 2MB.");
                return;
            }
            // Validation: Format
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setErrorMessage("Format file harus JPG, JPEG, atau PNG.");
                return;
            }

            setFileName(file.name);
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setErrorMessage("");
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setErrorMessage("");

            // Validation for Konsumtif
            if (tipePinjaman === "konsumtif" && !selectedFile) {
                setErrorMessage("Bukti nota pembelian wajib diunggah untuk pinjaman konsumtif.");
                setSubmitting(false);
                return;
            }

            if (isTopupPage && !topupReferenceLoan?.id) {
                setErrorMessage("Belum ada pinjaman yang disetujui untuk dijadikan dasar Top Up.");
                setSubmitting(false);
                return;
            }

            const payload = new FormData();
            payload.append("user_id", currentUserId);
            payload.append("type", tipePinjaman === "produktif" ? "Produktif" : "Konsumtif");
            payload.append("amount_requested", String(jumlah));
            payload.append("tenor_months", String(tenor));
            payload.append("start_date", bulanPotongGaji || "");
            payload.append("reason", keterangan || "");
            payload.append("loan_mode", isTopupPage ? "topup" : "new");

            if (isTopupPage && topupReferenceLoan?.id) {
                payload.append("refers_to_loan_id", String(topupReferenceLoan.id));
            }

            if (selectedFile) {
                payload.append("document", selectedFile);
            }

            await api.post("/loans", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setFeedback({
                open: true,
                message: isTopupPage
                    ? "Pengajuan top-up pinjaman berhasil dikirim."
                    : "Pengajuan pinjaman berhasil dikirim.",
                severity: "success",
            });
            
            // Trigger sidebar refresh
            window.dispatchEvent(new CustomEvent('refresh-menu-counts'));

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

    const handleCloseFeedback = () => {
        setFeedback((prev) => ({ ...prev, open: false }));
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
                {isTopupPage ? "Pengajuan Top-Up Pinjaman" : "Pengajuan Pinjaman Baru"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: { xs: 3, md: 4 }, maxWidth: 720 }}>
                Silakan lengkapi rincian pengajuan pinjaman Anda untuk proses verifikasi
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

                                {isTopupPage && (
                                    <Box>
                                        <Alert severity={topupReferenceLoan ? "info" : "warning"} sx={{ borderRadius: 2 }}>
                                            {referenceLoading
                                                ? "Memuat data pinjaman yang sudah disetujui..."
                                                : topupReferenceLoan
                                                    ? `Top Up akan menggunakan pinjaman #${topupReferenceLoan.loan_number} (Rp ${formatRupiah(topupReferenceLoan.jumlah_pinjaman)}).`
                                                    : "Belum ada pinjaman disetujui. Silakan ajukan pinjaman baru dulu lewat menu Pengajuan Baru."}
                                        </Alert>
                                    </Box>
                                )}

                                <Box>
                                    <Typography fontWeight={600} mb={1} fontSize={14}>
                                        Tipe Pinjaman
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant={tipePinjaman === "produktif" ? "contained" : "outlined"}
                                            onClick={() => setTipePinjaman("produktif")}
                                            sx={{ textTransform: "none", borderRadius: "12px" }}
                                        >
                                            Produktif
                                        </Button>
                                        <Button
                                            variant={tipePinjaman === "konsumtif" ? "contained" : "outlined"}
                                            onClick={() => setTipePinjaman("konsumtif")}
                                            sx={{ textTransform: "none", borderRadius: "12px" }}
                                        >
                                            Konsumtif
                                        </Button>
                                    </Stack>
                                </Box>

                                {tipePinjaman === "konsumtif" && (
                                    <Box>
                                        <Typography fontWeight={600} fontSize={14}>
                                            Kirim Bukti Nota Pinjaman Konsumtif
                                        </Typography>
                                        <Typography fontSize={13} color="text.secondary" mb={1}>
                                            Upload file nota pembelanjaan (JPG/PNG, Max 2MB)
                                        </Typography>

                                        <input hidden type="file" accept="image/*" ref={fileRef} onChange={handleFile} />

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

                                        {previewUrl && (
                                            <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                                                <Box 
                                                    component="img" 
                                                    src={previewUrl} 
                                                    alt="Preview" 
                                                    sx={{ 
                                                        width: 100, 
                                                        height: 100, 
                                                        borderRadius: '12px', 
                                                        objectFit: 'cover', 
                                                        border: '1px solid #e2e8f0',
                                                        display: 'block',
                                                        cursor: 'pointer'
                                                    }} 
                                                    onClick={() => setPreviewOpen(true)}
                                                />
                                                <Typography 
                                                    variant="caption" 
                                                    color="primary" 
                                                    sx={{ cursor: 'pointer', mt: 0.5, display: 'block' }}
                                                    onClick={() => setPreviewOpen(true)}
                                                >
                                                    Klik untuk memperbesar
                                                </Typography>
                                            </Box>
                                        )}
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
                                        {isTopupPage && topupReferenceLoan?.next_topup_month && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                                Saran dari referensi: {topupReferenceLoan.next_topup_month}
                                            </Typography>
                                        )}
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
                                    disabled={
                                        submitting
                                        || !jumlah
                                        || !bulanPotongGaji
                                        || (isTopupPage && !topupReferenceLoan?.id)
                                    }
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
                                    {submitting ? "Mengirim..." : (isTopupPage ? "Ajukan Top-Up" : "Ajukan Pinjaman")}
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
                            {isTopupPage ? "NOMINAL TOP-UP" : "TOTAL PINJAMAN"}
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

            <LoanFeedbackSnackbar
                open={feedback.open}
                message={feedback.message}
                severity={feedback.severity}
                onClose={handleCloseFeedback}
                autoHideDuration={2000}
            />

            {/* MODAL PREVIEW FIGMA-STYLE */}
            <Dialog 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)} 
                maxWidth="md" 
                PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={700}>Preview Bukti Nota</Typography>
                    <IconButton size="small" onClick={() => setPreviewOpen(false)}>
                        <IconCircleX size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                    <Box 
                        component="img" 
                        src={previewUrl} 
                        sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} 
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default LeadLoanCreatePage;
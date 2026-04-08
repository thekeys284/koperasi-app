import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Stack,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

const ConfirmPaymentModal = ({
  open,
  handleClose,
  loanData,
  onApprove,
  onReject,
  loading = false,
}) => {
  const [adminNote, setAdminNote] = useState("");

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove({ note: adminNote });
      setAdminNote("");
    }
  };

  const handleReject = async () => {
    if (onReject) {
      await onReject({ note: adminNote });
      setAdminNote("");
    }
  };

  const Row = ({ label, value }) => (
    <>
      <Stack direction="row" sx={{ p: 2 }}>
        <Typography sx={{ width: 160, color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography fontWeight={500}>{value}</Typography>
      </Stack>
      <Divider />
    </>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* TITLE */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Pengajuan Penundaan Cicilan

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        <Box>

          {/* DATA */}
          <Row label="ID Pinjaman" value={loanData?.id || "#PJM-2023001"} />
          <Row label="Cicilan ke-" value={loanData?.installment || "3"} />
          <Row label="Nominal" value={`Rp ${loanData?.amount || "1.000.000"}`} />
          <Row label="Tgl Jatuh Tempo" value={loanData?.dueDate || "12 Des 2023"} />

          {/* ALASAN USER */}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={500} mb={1}>
              Alasan
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              value={loanData?.reason || "ada keperluan keluarga mendadak"}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#f8fafc",
                },
              }}
            />
          </Box>

          <Divider />

          {/* CATATAN ADMIN */}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={500} mb={1}>
              Catatan Admin
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Tambahkan catatan untuk keputusan..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
          </Box>

          <Divider />

          {/* BUTTON */}
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ p: 2 }}
          >
            <Button
              variant="contained"
              onClick={handleReject}
              disabled={loading}
              sx={{
                bgcolor: "#dc2626",
                "&:hover": { bgcolor: "#b91c1c" },
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
              }}
            >
              Tolak
            </Button>

            <Button
              variant="contained"
              onClick={handleApprove}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
              }}
            >
              {loading ? "Memproses..." : "Setujui"}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPaymentModal;
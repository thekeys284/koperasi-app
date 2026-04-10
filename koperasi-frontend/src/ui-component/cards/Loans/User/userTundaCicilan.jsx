import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  IconButton,
  Box,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import api from "../../../../api/axios";

const PostponeInstallmentModal = ({ open, handleClose, data, onSuccess }) => {
  const [selectedCicilanId, setSelectedCicilanId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter cicilan yang bisa ditunda (hanya yang statusnya pending dan bukan ditunda)
  const availableInstallments = (data?.installments || []).filter(
    (item) => item.status_pembayaran === "pending" || item.status_pembayaran === "belum"
  );

  const selectedCicilan = availableInstallments.find(item => item.id === selectedCicilanId);

  const handleSubmit = async () => {
    if (!selectedCicilanId) {
      alert("Silakan pilih cicilan yang ingin ditunda.");
      return;
    }

    if (!reason.trim()) {
      alert("Alasan penundaan wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/loans/${data?.loanId}/postpone-request`, {
        reason,
        cicilan_id: selectedCicilanId, // Kirim ID cicilan yang dipilih
        user_id: 10,
      });

      if (response.data.success) {
        alert("Pengajuan penundaan cicilan berhasil dikirim!");
        if (onSuccess) onSuccess();
        handleClose();
        // Reset state
        setSelectedCicilanId("");
        setReason("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengirim pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ label, value }) => (
    <>
      <Stack
        direction="row"
        justifyContent="flex-start"
        gap={2}
        sx={{ p: 2 }}
      >
        <Typography sx={{ width: 160 }}>{label}</Typography>

        <Typography fontWeight={600}>{value}</Typography>
      </Stack>

      <Divider />
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
        }}
      >
        Pengajuan Penundaan Cicilan

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* INFO CICILAN */}

        <Row label="ID Pinjaman" value={data?.loanNumber ? `#${data.loanNumber}` : "-"} />

        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          gap={2}
          sx={{ p: 2 }}
        >
          <Typography sx={{ width: 160 }}>Pilih Cicilan</Typography>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={selectedCicilanId}
              onChange={(e) => setSelectedCicilanId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>Pilih Bulan Cicilan</MenuItem>
              {availableInstallments.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  Cicilan {item.cicilan} ({new Date(item.tanggal_pembayaran).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider />

        <Row 
          label="Nominal" 
          value={selectedCicilan ? `Rp ${Number(selectedCicilan.nominal).toLocaleString('id-ID')}` : "-"} 
        />

        <Row
          label="Tgl Jatuh Tempo"
          value={selectedCicilan ? new Date(selectedCicilan.tanggal_pembayaran).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-"}
        />

        {/* ALASAN */}

        <Box sx={{ p: 2 }}>
          <Typography
            fontWeight={500}
            mb={1}
          >
            Alasan
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Tuliskan alasan penundaan..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
            color="inherit"
            onClick={handleClose}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Ajukan Penundaan"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PostponeInstallmentModal;
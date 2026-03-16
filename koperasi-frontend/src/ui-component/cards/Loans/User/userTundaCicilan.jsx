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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

const PostponeInstallmentModal = ({ open, handleClose, data }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    const payload = {
      loanId: data?.loanId,
      installment: data?.installment,
      reason,
    };

    console.log("Pengajuan Penundaan:", payload);

    handleClose();
  };

  const Row = ({ label, value }) => (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ px: 3, py: 2 }}
      >
        <Typography color="text.secondary">{label}</Typography>

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

        <Row label="ID Pinjaman" value={data?.loanId || "#PJM-2023001"} />

        <Row label="Cicilan ke-" value={data?.installment || "3"} />

        <Row label="Nominal" value={data?.amount || "Rp 1.000.000"} />

        <Row
          label="Tgl Jatuh Tempo"
          value={data?.dueDate || "12 Des 2023"}
        />

        {/* ALASAN */}

        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            fontWeight={600}
            color="text.secondary"
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
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
          sx={{ px: 3, py: 2 }}
        >
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              background: "#64748B",
              "&:hover": { background: "#475569" },
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: "#2563EB",
              "&:hover": { background: "#1D4ED8" },
            }}
          >
            Ajukan Penundaan
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PostponeInstallmentModal;
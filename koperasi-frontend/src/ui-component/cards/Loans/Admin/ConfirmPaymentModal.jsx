import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Stack,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

const ConfirmPaymentModal = ({ open, handleClose, loanData }) => {
  const [tukinStatus, setTukinStatus] = useState("sudah");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const payload = {
      tukinStatus,
      note,
    };

    console.log("Data konfirmasi:", payload);

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* TITLE */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Konfirmasi Pembayaran Cicilan

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* INFO PINJAMAN */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography>ID Pinjaman</Typography>
            <Typography fontWeight={600}>
              {loanData?.id || "#PJM-2023001"}
            </Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography>Cicilan ke-</Typography>
            <Typography>{loanData?.installment || "3"}</Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography>Nominal</Typography>
            <Typography>Rp {loanData?.amount || "1.000.000"}</Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography>Tgl Jatuh Tempo</Typography>
            <Typography>{loanData?.dueDate || "12 Des 2023"}</Typography>
          </Stack>

          <Divider />

          {/* RADIO */}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={500} mb={1}>
              Apakah tukin pegawai sudah terpotong untuk angsuran bulan ini?
            </Typography>

            <RadioGroup
              row
              value={tukinStatus}
              onChange={(e) => setTukinStatus(e.target.value)}
            >
              <FormControlLabel
                value="belum"
                control={<Radio />}
                label="Belum"
              />
              <FormControlLabel
                value="sudah"
                control={<Radio />}
                label="Sudah"
              />
            </RadioGroup>
          </Box>

          <Divider />

          {/* CATATAN */}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={500} mb={1}>
              Catatan Admin
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Tambahkan catatan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
            >
              Kirim
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPaymentModal;
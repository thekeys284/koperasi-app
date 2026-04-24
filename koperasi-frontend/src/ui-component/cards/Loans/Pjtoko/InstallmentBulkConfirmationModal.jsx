import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
} from "@mui/material";

const InstallmentBulkConfirmationModal = ({
  open,
  onClose,
  selectedInstallments,
  isUpdating,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (isUpdating) return;
        onClose();
      }}
      PaperProps={{
        sx: { borderRadius: 3, p: 1, width: "100%", maxWidth: 520 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        Konfirmasi Pembayaran Cicilan
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Apakah Anda ingin menyetujui pembayaran cicilan pada {selectedInstallments.length} anggota berikut:
        </Typography>
        <Box
          sx={{
            bgcolor: "#F8FAFC",
            p: 2,
            borderRadius: 2,
            border: "1px solid #CBD5E1",
            maxHeight: 100,
            overflowY: "auto",
            boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: "10px" },
          }}
        >
          {selectedInstallments.map((item, idx) => (
            <Typography
              key={item.installmentId}
              variant="body2"
              fontWeight={700}
              color="primary"
              sx={{ mb: 0.8 }}
            >
              {idx + 1}. {item.userName}
            </Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isUpdating}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5 }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={selectedInstallments.length === 0 || isUpdating}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            boxShadow: "none",
          }}
        >
          {isUpdating
            ? "Menyimpan..."
            : `Ya, Konfirmasi ${selectedInstallments.length} Cicilan`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallmentBulkConfirmationModal;

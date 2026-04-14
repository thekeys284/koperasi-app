import React from "react";
import { Snackbar, Alert } from "@mui/material";

const LoanFeedbackSnackbar = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", borderRadius: "8px" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default LoanFeedbackSnackbar;
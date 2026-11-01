import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

/** Basit onay penceresi. */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  confirmColor = "error",
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    {message && (
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
    )}
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">
        {cancelLabel}
      </Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

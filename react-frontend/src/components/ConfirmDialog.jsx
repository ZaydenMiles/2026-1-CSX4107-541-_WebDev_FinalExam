//src/components/ConfirmDialog.jsx

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  isBusy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isBusy}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isBusy}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

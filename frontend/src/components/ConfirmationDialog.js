import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const Title = ({ title }) => {
  if (!title) {
    return null;
  }

  return <DialogTitle>{title}</DialogTitle>;
};

function ConfirmationDialog({
  title,
  description,
  confirmCallback,
  cancelCallback,
  open,
}) {
  const handleCancel = () => {
    cancelCallback();
  };

  const handleConfirm = () => {
    confirmCallback();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <Title title={title} />
      <DialogContent>{description}</DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={handleConfirm} color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;

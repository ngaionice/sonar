import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";

function SettingsModule({ successCallback }) {
  const [open, setOpen] = useState(!localStorage.getItem("hostAddress"));

  const [serverAddress, setServerAddress] = useState(
    localStorage.getItem("hostAddress") ?? ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("hostAddress", serverAddress);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [serverAddress]);

  const handleClose = () => {
    if (localStorage.getItem("hostAddress")) setOpen(false);
  };

  const handleSave = () => {
    localStorage.setItem("hostAddress", serverAddress);
    handleClose();
  };

  const handleServerAddressChange = (e) => {
    setServerAddress(e.target.value);
  };

  const DialogContent = () => {
    return (
      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Server address"
            size="small"
            value={serverAddress}
            onChange={handleServerAddressChange}
            fullWidth
            autoFocus
          />
        </Stack>
      </Container>
    );
  };

  return (
    <>
      <Tooltip title="Settings" arrow>
        <IconButton onClick={() => setOpen(true)}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent />
        <DialogActions>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SettingsModule;

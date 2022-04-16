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
import { useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import { useSettings } from "../contexts/settingsContext";

function SettingsModule() {
  const [settings, dispatchSettings] = useSettings();
  const [open, setOpen] = useState(!settings.serverUrl);

  const [serverAddress, setServerAddress] = useState(settings.serverUrl);

  const handleClose = () => {
    if (settings.serverUrl) setOpen(false);
  };

  const handleSave = () => {
    dispatchSettings({ type: "setServerUrl", payload: serverAddress });
    handleClose();
  };

  const handleServerAddressChange = (e) => {
    setServerAddress(e.target.value);
  };

  const DialogContent = () => {
    return (
      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        <Stack spacing={2} flexGrow={1}>
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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent />
        <DialogActions>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SettingsModule;

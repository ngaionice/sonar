import BasePage from "./BasePage";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useUser } from "../contexts/userContext";
import { useSettings } from "../contexts/settingsContext";

function UserEntry({ email, details, availableRoles, serverUrl, userToken }) {
  const [roles, setRoles] = useState(details.roles || []);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [currRoles, setCurrRoles] = useState(roles);
  const [currName, setCurrName] = useState(details.name);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSave = () => {
    axios
      .put(
        `${serverUrl}/api/users/one`,
        { email, name: currName, roles: currRoles },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      .then(() => {
        details.name = currName;
        setRoles(currRoles);
        handleDialogClose();
      });
  };

  const DialogContent = () => {
    const handleNameChange = (e) => {
      setCurrName(e.target.value);
    };

    return (
      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        <Stack spacing={2}>
          <TextField
            value={currName}
            onChange={handleNameChange}
            label="Name"
            autoFocus // TODO: figure out what makes it lose focus every time
          />
          <Autocomplete
            multiple
            options={availableRoles}
            getOptionLabel={(option) => option}
            filterSelectedOptions
            renderInput={(params) => <TextField {...params} label="Roles" />}
            value={currRoles}
            onChange={(e, nv) => setCurrRoles(nv)}
          />
        </Stack>
      </Container>
    );
  };

  return (
    <ListItem>
      <ListItemButton onClick={() => setDialogOpen(true)}>
        <ListItemText primary={details.name} secondary={email} />
        {roles.map((r) => (
          <Chip label={r} key={r} />
        ))}
      </ListItemButton>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent />
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
}

function ManageUsersPage() {
  const [user] = useUser();
  const [settings] = useSettings();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      const res = await axios.get(`${settings.serverUrl}/api/users/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { users } = res.data;
      return users;
    };

    const fetchRoles = async () => {
      const res = await axios.get(`${settings.serverUrl}/api/users/roles`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { roles } = res.data;
      return roles;
    };

    setLoading(true);
    fetchUsers()
      .then((users) => {
        if (mounted) {
          setUsers(users);
        }
      })
      .then(() => fetchRoles())
      .then((roles) => {
        if (mounted) {
          setRoles(roles);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [setUsers, settings, user]);

  const Content = () => {
    if (loading) {
      return <CircularProgress />;
    }

    return (
      <List>
        {Object.entries(users).map(([k, v]) => (
          <UserEntry
            key={k}
            email={k}
            details={v}
            availableRoles={roles}
            serverUrl={settings.serverUrl}
            userToken={user.token}
          />
        ))}
      </List>
    );
  };

  return (
    <BasePage title="Users">
      <Content />
    </BasePage>
  );
}

export default ManageUsersPage;

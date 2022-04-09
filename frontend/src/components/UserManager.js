import { useEffect, useState } from "react";
import axios from "axios";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";
import { useUser } from "../contexts/userContext";
import { useSettings } from "../contexts/settingsContext";

function UserRoleCreator({ setFetchOnChange }) {
  const [user] = useUser();
  const [settings] = useSettings();
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await axios.get(`${settings.serverUrl}/api/users/roles`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { roles } = res.data;
      return roles;
    };

    fetchRoles().then((roles) => setAvailableRoles(roles));
  }, [settings, user]);

  const AddUserButton = () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [roles, setRoles] = useState([]);

    const handleSave = () => {
      axios
        .post(
          `${settings.serverUrl}/api/users/one`,
          { email, name, roles },
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        .then(() => {
          setFetchOnChange(new Date());
          handleClose();
        });
    };

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setEmail("");
      setName("");
      setRoles([]);
    };

    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    };

    return (
      <>
        <Button onClick={handleOpen}>Add User</Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add User</DialogTitle>
          <DialogContent>
            <Container maxWidth="md" sx={{ paddingY: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={handleEmailChange}
                />
                <TextField
                  label="Name"
                  value={name}
                  onChange={handleNameChange}
                />
                <Autocomplete
                  multiple
                  options={availableRoles}
                  getOptionLabel={(option) => option}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField {...params} label="Roles" />
                  )}
                  value={roles}
                  onChange={(e, nv) => setRoles(nv)}
                />
              </Stack>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const AddRoleButton = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const handleSave = () => {
      axios
        .post(
          `${settings.serverUrl}/api/users/role`,
          { name },
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        .then(() => {
          setFetchOnChange(new Date());
          handleClose();
        });
    };

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setName("");
    };

    const handleNameChange = (e) => {
      setName(e.target.value);
    };

    return (
      <>
        <Button onClick={handleOpen}>Add Role</Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Role</DialogTitle>
          <DialogContent>
            <Container maxWidth="md" sx={{ paddingY: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={handleNameChange}
                />
              </Stack>
            </Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  return (
    <Stack spacing={4} direction="row">
      <AddUserButton />
      <AddRoleButton />
    </Stack>
  );
}

function UserEntry({
  email,
  details,
  availableRoles,
  serverUrl,
  userToken,
  setFetchOnChange,
}) {
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

  const handleDelete = () => {
    axios
      .delete(`${serverUrl}/api/users/one`, {
        headers: { Authorization: `Bearer ${userToken}` },
        params: { email },
      })
      .then(() => {
        setFetchOnChange(new Date());
      });
  };

  const DialogContents = () => {
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
        <Stack spacing={1} direction="row">
          {roles.map((r) => (
            <Chip label={r} key={r} />
          ))}
        </Stack>
      </ListItemButton>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent>
          <DialogContents />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
          <Button onClick={handleDialogClose}>Close</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
}

function UserManager({ fetchOnChange, setFetchOnChange }) {
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
  }, [setUsers, settings, user, fetchOnChange]);

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
          setFetchOnChange={setFetchOnChange}
        />
      ))}
    </List>
  );
}

export { UserManager, UserRoleCreator };

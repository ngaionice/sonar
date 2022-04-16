import {
  Autocomplete,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/userContext";
import { useSettings } from "../contexts/settingsContext";
import getAxiosInstance from "../utilities/axios";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

function RoleAdder({ setDisplay, setReload }) {
  const [user, setUser] = useUser();
  const [settings] = useSettings();
  const [name, setName] = useState("");

  const refreshTokenCall = useRef(null);

  const axios = getAxiosInstance(
    settings.serverUrl,
    setUser,
    user.tokens?.refresh?.token,
    refreshTokenCall
  );

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleClose = () => {
    setDisplay(false);
  };

  const handleSave = async () => {
    await axios.post(
      "/users/role",
      { name },
      {
        headers: { Authorization: `Bearer ${user?.tokens?.access?.token}` },
      }
    );
    handleClose();
    if (!setReload) {
      throw new Error(
        "A setReload function is required to update options after adding a new role."
      );
    }
    setReload(true);
  };

  const BackButton = () => {
    return (
      <Tooltip title="Back">
        <IconButton onClick={handleClose}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const SaveButton = () => {
    if (!name) {
      return (
        <Tooltip title="Save new role">
          <span>
            <IconButton onClick={handleSave} disabled>
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Save new role">
        <IconButton onClick={handleSave}>
          <SaveIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <TextField
        autoFocus
        label="Role name"
        value={name}
        onChange={handleNameChange}
      />
      <BackButton />
      <SaveButton />
    </Stack>
  );
}

function RoleSelector({ roles, setRoles, reload, setReload }) {
  const [user, setUser] = useUser();
  const [settings] = useSettings();
  const refreshTokenCall = useRef(null);

  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!reload) {
      return () => {
        mounted = false;
      };
    }

    const axios = getAxiosInstance(
      settings.serverUrl,
      setUser,
      user.tokens?.refresh?.token,
      refreshTokenCall
    );

    const fetchRoles = async () => {
      const res = await axios.get("/users/roles", {
        headers: { Authorization: `Bearer ${user?.tokens?.access?.token}` },
      });
      const { roles } = res.data;
      return roles;
    };

    setLoading(true);
    fetchRoles().then((roles) => {
      if (mounted) {
        setRoleOptions(roles);
        setLoading(false);
        setReload(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [settings, user, reload, setReload, setUser]);

  const extractOption = (option) => option;

  return (
    <Autocomplete
      multiple
      disabled={loading}
      options={roleOptions}
      getOptionLabel={extractOption}
      filterSelectedOptions
      renderInput={(params) => <TextField {...params} label="Roles" />}
      value={roles}
      onChange={(e, nv) => setRoles(nv)}
    />
  );
}

function RoleEditor({ roles, setRoles }) {
  const [showAdder, setShowAdder] = useState(false);
  const [reload, setReload] = useState(true);

  const handleAddClick = () => {
    setShowAdder(true);
  };

  if (showAdder) {
    return <RoleAdder setDisplay={setShowAdder} setReload={setReload} />;
  }

  const AddRoleButton = () => (
    <Tooltip title="Add new role">
      <IconButton onClick={handleAddClick}>
        <AddIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <RoleSelector
        roles={roles}
        setRoles={setRoles}
        reload={reload}
        setReload={setReload}
      />
      <AddRoleButton />
    </Stack>
  );
}

export default RoleEditor;

import { Button, ButtonGroup, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../contexts/userContext";
import { useSettings } from "../contexts/settingsContext";

function SearchModule({ setResults }) {
  const [user] = useUser();
  const [settings] = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState(2);

  useEffect(() => {
    let changed = false;

    const search = async () => {
      return await axios.get(`${settings.serverUrl}/api/files/search`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          term: searchTerm,
          mode,
        },
      });
    };

    const timerId = setTimeout(() => {
      if (searchTerm) {
        search().then((res) => {
          if (!changed) {
            const { data } = res;
            setResults(data);
          }
        });
      }
    }, 200);

    return () => {
      clearTimeout(timerId);
      changed = true;
    };
  }, [searchTerm, mode, setResults, user.token]);

  const handleTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const SearchField = () => {
    return (
      <TextField
        autoFocus
        size="small"
        label="Search term"
        onChange={handleTermChange}
        value={searchTerm}
        fullWidth
      />
    );
  };

  const ModeButtons = () => {
    const modes = [
      { v: 2, l: "Partial" },
      { v: 1, l: "Insensitive" },
      { v: 0, l: "Exact" },
    ];

    return (
      <ButtonGroup>
        {modes.map((m) => {
          return (
            <Button
              onClick={() => setMode(m.v)}
              key={m.v}
              variant={mode === m.v ? "contained" : "outlined"}
              disableElevation
              sx={{ height: "40px" }}
            >
              {m.l}
            </Button>
          );
        })}
      </ButtonGroup>
    );
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <ModeButtons />
      <SearchField />
    </Stack>
  );
}

export default SearchModule;

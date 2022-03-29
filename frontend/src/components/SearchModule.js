import { Button, ButtonGroup, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../contexts/userContext";

function SearchModule({ setResults }) {
  const [user] = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState(2);

  useEffect(() => {
    let changed = false;

    const search = async () => {
      return await axios.get("http://localhost:8000/api/files/search", {
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
        label="Search"
        onChange={handleTermChange}
        value={searchTerm}
      />
    );
  };

  const ModeButtons = () => {
    const modes = [
      { v: 0, l: "Exact" },
      { v: 1, l: "Insensitive" },
      { v: 2, l: "Partial" },
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
            >
              {m.l}
            </Button>
          );
        })}
      </ButtonGroup>
    );
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <SearchField />
      <ModeButtons />
    </Stack>
  );
}

export default SearchModule;

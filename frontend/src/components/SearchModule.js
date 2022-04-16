import { InputAdornment, Stack, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/userContext";
import { useSettings } from "../contexts/settingsContext";
import getAxiosInstance from "../utilities/axios";
import SearchIcon from "@mui/icons-material/Search";

function SearchModule({ setResults }) {
  const [user, setUser] = useUser();
  const [settings] = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const refreshTokenCall = useRef(null);

  useEffect(() => {
    let changed = false;

    const search = async () => {
      const axios = getAxiosInstance(
        settings.serverUrl,
        setUser,
        user.tokens?.refresh?.token,
        refreshTokenCall
      );
      return await axios.get("/files/search", {
        headers: {
          Authorization: `Bearer ${user.tokens?.access?.token}`,
        },
        params: {
          term: searchTerm,
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
  }, [searchTerm, setResults, user, setUser, settings]);

  const handleTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const SearchField = () => {
    return (
      <TextField
        autoFocus
        size="small"
        onChange={handleTermChange}
        value={searchTerm}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
      />
    );
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <SearchField />
    </Stack>
  );
}

export default SearchModule;

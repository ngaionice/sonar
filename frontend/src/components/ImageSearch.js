import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { axios } from "../utilities/axios";
import SearchIcon from "@mui/icons-material/Search";

function ImageSearch({ setResults }) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let changed = false;

    const search = async () => {
      return await axios.get("/files/search", {
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
  }, [searchTerm, setResults]);

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
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    );
  };

  return <SearchField />;
}

export default ImageSearch;

import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { axios } from "../utilities/axios";
import SearchIcon from "@mui/icons-material/Search";

function ImageSearch({ setResults, setIsFocused }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchBarRef = useRef(null);

  useEffect(() => {
    const listener = (e) => {
      if (e.altKey && e.code === "KeyS") {
        searchBarRef.current.focus();
      }
    };

    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

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

  const handleFocus = () => {
    console.log("focused");
    setIsFocused(true);
  };

  const handleBlur = () => {
    console.log("blurred");
    setIsFocused(false);
  };

  return (
    <TextField
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
      inputRef={searchBarRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

export default ImageSearch;

import {
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useUser } from "../contexts/userContext";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import StyleIcon from "@mui/icons-material/Style";
import UploadIcon from "@mui/icons-material/Upload";

function UploadForm() {
  const [user] = useUser();
  const [selected, setSelected] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState([]);

  const handleFileSelection = () => {
    const fullPath = document.getElementById("selectedFile").value;
    const fileName = fullPath.split("\\").pop();
    setSelected(fileName);
  };

  const handleTagInsert = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!tags.includes(e.target.value)) {
        setTags([...tags, e.target.value]);
      }
    }
  };

  const handleChangePublic = (e) => {
    setIsPublic(e.target.checked);
  };

  const handleTagDelete = (index) => {
    console.log(tags.filter((_, i) => i !== index));
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById("selectedFile");
    console.log(file.files);
    for (let i = 0; i < file.files.length; i++) {
      formData.append("image", file.files[i]);
    }
    formData.append("tags", JSON.stringify(tags));
    if (isPublic) {
      formData.append("isPublic", "1");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    axios
      .post("http://localhost:8000/api/files/upload", formData, config)
      .then(() => {})
      .catch((e) => {
        // TODO: some error handling?
        alert("Failed to upload file.");
      })
      .then(() => {
        document.getElementById("selectedFile").value = null;
        setTags([]);
        setSelected(null);
      });
  };

  const FileName = () => {
    if (!selected) return null;

    return (
      <Typography variant="body2" sx={{ paddingTop: "3px" }}>
        {selected}
      </Typography>
    );
  };

  const PublicControl = () => {
    if (!selected) return null;

    return (
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked
            checked={isPublic}
            onChange={handleChangePublic}
          />
        }
        label="Share publicly"
      />
    );
  };

  const Tagger = () => {
    if (!selected) return null;

    return (
      <Container maxWidth="sm">
        <Stack spacing={1}>
          <TextField
            size="small"
            label="Tags"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StyleIcon />
                </InputAdornment>
              ),
            }}
            onKeyDown={handleTagInsert}
          />
          <Stack direction="row" spacing={1}>
            {tags.map((t, i) => (
              <Chip label={t} key={t} onDelete={() => handleTagDelete(i)} />
            ))}
          </Stack>
        </Stack>
      </Container>
    );
  };

  const Upload = () => {
    if (!selected) return null;

    return (
      <Tooltip title="Upload" arrow>
        <IconButton type="submit">
          <UploadIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Stack spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Select image" arrow>
              <IconButton variant="contained" component="label">
                <AddPhotoAlternateIcon />
                <input
                  type="file"
                  id="selectedFile"
                  hidden
                  onChange={handleFileSelection}
                />
              </IconButton>
            </Tooltip>
            <FileName />
          </Stack>
          <PublicControl />
          <Tagger />
          <Upload />
        </Stack>
      </form>
    </div>
  );
}

export default UploadForm;

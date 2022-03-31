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
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import LinkIcon from "@mui/icons-material/Link";
import StyleIcon from "@mui/icons-material/Style";
import UploadIcon from "@mui/icons-material/Upload";

function UploadForm() {
  const [user] = useUser();
  const [selected, setSelected] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [uploadMode, setUploadMode] = useState(0);
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
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    switch (uploadMode) {
      case 0:
        const file = document.getElementById("selectedFile");
        console.log(file.files);

        for (let i = 0; i < file.files.length; i++) {
          formData.append("image", file.files[i]);
        }
        break;
      case 1:
        formData.append("srcUrl", selected);
        break;
      case 2:
        break;
      default:
        throw new Error("Illegal selected value.");
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
      .catch((e) => {
        // TODO: some error handling?
        console.log(e);
        alert("Failed to upload file.");
      })
      .then(() => {
        if (uploadMode === 0) {
          document.getElementById("selectedFile").value = null;
        }
        setTags([]);
        setSelected("");
      });
  };

  const FileUploader = () => {
    const FileName = () => {
      if (!selected) return null;

      return (
        <Typography variant="body2" sx={{ paddingTop: "3px" }}>
          {selected}
        </Typography>
      );
    };

    return (
      <form>
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
      </form>
    );
  };

  const UrlUploader = () => {
    const handleChange = (e) => {
      setSelected(e.target.value);
    };

    return <TextField size="small" onChange={handleChange} value={selected} />;
  };

  const ModePicker = () => {
    const handleClick = (val) => {
      setUploadMode(val);
      setSelected("");
    };

    const modes = [<UploadIcon />, <LinkIcon />, <ContentPasteIcon />];
    return (
      <Stack direction="row" spacing={1}>
        {modes.map((m, index) => (
          <IconButton key={index} onClick={() => handleClick(index)}>
            {m}
          </IconButton>
        ))}
      </Stack>
    );
  };

  const UploadOptions = () => {
    const Uploader = () => {
      if (uploadMode === 0) {
        return <FileUploader />;
      } else if (uploadMode === 1) {
        return <UrlUploader />;
      } else if (uploadMode === 2) {
        return null;
      } else {
        return null;
      }
    };

    return (
      <Stack spacing={1}>
        <ModePicker />
        <Uploader />
      </Stack>
    );
  };

  const PublicCheckbox = () => {
    if (!selected) return null;

    return (
      <FormControlLabel
        control={<Checkbox checked={isPublic} onChange={handleChangePublic} />}
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
            autoFocus
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

  const UploadButton = () => {
    if (!selected) return null;

    return (
      <Tooltip title="Upload" arrow>
        <IconButton onClick={handleSubmit}>
          <UploadIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Stack spacing={1} alignItems="center">
      <UploadOptions />
      <PublicCheckbox />
      <Tagger />
      <UploadButton />
    </Stack>
  );
}

export default UploadForm;

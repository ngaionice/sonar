import {
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useUser } from "../contexts/userContext";

import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import { LoadingButton } from "@mui/lab";
import { axios } from "../utilities/axios";
import TagEditor from "./TagEditor";
import RoleEditor from "./RoleEditor";

const FileUploader = ({ setSelected }) => {
  const handleFileSelection = () => {
    const selector = document.getElementById("selectedFile");
    setSelected({ type: "file", data: selector.files[0] });
  };

  useEffect(() => {
    const listener = (e) => {
      // Get the data of clipboard
      const clipboardItems = e.clipboardData.items;
      const items = [...clipboardItems].filter(
        (item) => item.type.indexOf("image") !== -1
      );
      if (items.length === 0) {
        return;
      }

      // Get the blob of image
      const blob = items[0].getAsFile();
      setSelected({ type: "file", data: blob });
    };
    document.addEventListener("paste", listener);
    return () => {
      document.removeEventListener("paste", listener);
    };
  }, [setSelected]);

  return (
    <Stack alignItems="center">
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Button variant="contained" component="label">
          Select image
          <input
            type="file"
            id="selectedFile"
            hidden
            onChange={handleFileSelection}
          />
        </Button>
        <Typography variant="body1">
          or paste an image here with <kbd>Ctrl</kbd> + <kbd>V</kbd>.
        </Typography>
      </Stack>
    </Stack>
  );
};

const UrlUploader = ({ selected, setSelected }) => {
  const handleChange = (e) => {
    if (!e.target.value) {
      setSelected({});
    } else {
      setSelected({ type: "url", data: e.target.value });
    }
  };

  return (
    <TextField
      size="small"
      label="URL"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CodeIcon />
          </InputAdornment>
        ),
      }}
      onChange={handleChange}
      value={selected?.type === "url" ? selected?.data : ""}
    />
  );
};

const ModePicker = ({ setUploadMode, setSelected }) => {
  const handleClick = (val) => {
    setUploadMode(val);
    setSelected({});
  };

  const modes = [
    { icon: <AttachFileIcon />, label: "From files/clipboard" },
    { icon: <LinkIcon />, label: "From link" },
  ];
  return (
    <Stack direction="row" spacing={1} justifyContent="center" flex={1}>
      {modes.map((obj, index) => (
        <Tooltip title={obj.label} key={index} arrow>
          <IconButton onClick={() => handleClick(index)}>{obj.icon}</IconButton>
        </Tooltip>
      ))}
    </Stack>
  );
};

const PreviewPanel = ({ selected }) => {
  const FileName = () => {
    if (selected?.type !== "file") return null;

    return (
      <Typography variant="body2" sx={{ paddingTop: "3px" }}>
        {selected.data?.name ?? "Name not available"}
      </Typography>
    );
  };

  const PreviewImage = () => {
    if (!selected.type) return null;

    let src;
    if (selected.type === "file") {
      src = URL.createObjectURL(selected.data);
    } else if (selected.type === "url") {
      src = selected.data;
    } else {
      src = "";
      alert("Invalid selected.type.");
    }

    return (
      <>
        <FileName />
        <img
          src={src}
          alt="Upload preview"
          style={{
            maxWidth: "10rem",
            width: "100%",
            maxHeight: "10rem",
            height: "100%",
          }}
        />
      </>
    );
  };

  return (
    <Stack id="preview-panel" alignItems="center">
      <PreviewImage />
    </Stack>
  );
};

const ImgurCheckbox = ({ isPublic, setIsPublic }) => {
  const handleChangePublic = (e) => {
    setIsPublic(e.target.checked);
  };

  return (
    <FormControlLabel
      control={<Checkbox checked={isPublic} onChange={handleChangePublic} />}
      label="Also upload to Imgur"
    />
  );
};

const enforcedReadRoles = ["Admin"];

function UploadForm() {
  const [user] = useUser();
  const [selected, setSelected] = useState({});
  const [isPublic, setIsPublic] = useState(false);
  const [uploadMode, setUploadMode] = useState(0);
  const [readRoles, setReadRoles] = useState([]);
  const [tags, setTags] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const uploadHotkeyListener = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.code === "KeyA") {
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", uploadHotkeyListener);
    return () => {
      document.removeEventListener("keydown", uploadHotkeyListener);
    };
  }, []);

  if (!user.isSignedIn) return null;

  const reset = () => {
    setTags([]);
    setSelected({});
    setReadRoles(enforcedReadRoles);
  };

  const UploadOptions = () => {
    const Uploader = () => {
      if (uploadMode === 0) {
        return <FileUploader setSelected={setSelected} />;
      } else if (uploadMode === 1) {
        return <UrlUploader selected={selected} setSelected={setSelected} />;
      } else {
        return null;
      }
    };

    return (
      <Stack spacing={1}>
        <ModePicker setSelected={setSelected} setUploadMode={setUploadMode} />
        <Uploader />
      </Stack>
    );
  };

  const UploadButton = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
      setLoading(true);
      const formData = new FormData();
      switch (selected.type) {
        case "file":
          if (selected.data.size > 15728640) {
            alert("Failed to upload: file too large.");
            return;
          } else if (selected.data.type.search(/image\//) !== 0) {
            alert("Failed to upload: invalid file type.");
            return;
          } else {
            formData.append("image", selected.data);
          }
          break;
        case "url":
          formData.append("srcUrl", selected.data);
          break;
        default:
          alert("Illegal selected.type value.");
      }
      formData.append("tags", JSON.stringify(tags));
      formData.append("readRoles", JSON.stringify(readRoles));
      if (isPublic) {
        formData.append("isPublic", "1");
      }

      axios
        .post(`/files/one`, formData)
        .catch((e) => {
          alert(`Error ${e.response.status}: ${e.response.data}`);
        })
        .then(() => {
          if (uploadMode === 0) {
            document.getElementById("selectedFile").value = null;
          }
          setLoading(false);
          handleDialogClose();
        });
    };

    return (
      <LoadingButton
        onClick={handleSubmit}
        variant="contained"
        loading={loading}
      >
        Done
      </LoadingButton>
    );
  };

  const DialogContents = () => {
    return (
      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        <Stack spacing={2}>
          <UploadOptions />
          <PreviewPanel selected={selected} />
          <TagEditor tags={tags} setTags={setTags} />
          <RoleEditor
            roles={readRoles}
            setRoles={setReadRoles}
            enforcedRoles={enforcedReadRoles}
          />
          <ImgurCheckbox isPublic={isPublic} setIsPublic={setIsPublic} />
        </Stack>
      </Container>
    );
  };

  const handleDialogClose = () => {
    reset();
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip title="Upload" arrow>
        <IconButton onClick={() => setDialogOpen(true)}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload</DialogTitle>
        <DialogContents />
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <UploadButton />
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UploadForm;

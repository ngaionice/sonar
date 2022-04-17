import {
  Box,
  Button,
  ButtonBase,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { Masonry } from "@mui/lab";
import { axios } from "../utilities/axios";
import ConditionalRenderer from "./ConditionalRenderer";
import TagEditor from "./TagEditor";
import RoleEditor from "./RoleEditor";

function getUrls(baseUrl) {
  const urlModifiers = "w=248&fit=crop&auto=format";
  const urlSetModifiers = "&dpr=2 2x";

  const extension = baseUrl.indexOf("?") === -1 ? "?" : "&";

  const srcUrl = baseUrl + extension + urlModifiers;
  const srcSetUrl = baseUrl + extension + urlModifiers + urlSetModifiers;
  return [srcUrl, srcSetUrl];
}

const UrlDisplay = ({ url }) => {
  const [displayIcon, setDisplayIcon] = useState(<ContentCopyIcon />);

  const handleClick = () => {
    navigator.clipboard.writeText(url).then(() => {
      setDisplayIcon(<CheckIcon />);
      setTimeout(() => setDisplayIcon(<ContentCopyIcon />), 2000);
    });
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField disabled value={url} size="small" fullWidth />
      <IconButton onClick={handleClick}>{displayIcon}</IconButton>
    </Stack>
  );
};

const DeleteButton = ({ imageId, index, handleClose, onDeleteCallback }) => {
  if (!imageId || isNaN(index)) return null;

  const handleClick = () => {
    axios
      .delete(`/files/one`, {
        params: {
          keys: JSON.stringify([imageId]),
        },
      })
      .then(() => {
        onDeleteCallback();
        handleClose();
      });
  };

  return (
    <Button onClick={handleClick} color="error" variant="outlined">
      Delete
    </Button>
  );
};

const SaveButton = ({ title, tags, readRoles, handleClose }) => {
  const handleClick = () => {
    axios
      .put("/files/one", { id: title, tags, readRoles })
      .then(() => {
        handleClose();
      })
      .catch((e) => {
        console.log(e);
        alert(`Failed to update data for ${title}.`);
      });
  };

  return (
    <Button onClick={handleClick} variant="contained">
      Save
    </Button>
  );
};

function ImageEntryDialog({
  dialogOpen,
  handleClose,
  url,
  title,
  index,
  onDeleteCallback,
}) {
  const [tags, setTags] = useState([]);
  const [readRoles, setReadRoles] = useState([]);

  return (
    <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <ImageEntryDialogContent
          url={url}
          title={title}
          tags={tags}
          setTags={setTags}
          roles={readRoles}
          setRoles={setReadRoles}
        />
      </DialogContent>

      <DialogActions>
        <ConditionalRenderer condition="loggedInAdmin">
          <DeleteButton
            handleClose={handleClose}
            imageId={title}
            index={index}
            onDeleteCallback={onDeleteCallback}
          />
          <SaveButton
            handleClose={handleClose}
            title={title}
            tags={tags}
            readRoles={readRoles}
          />
        </ConditionalRenderer>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function ImageEntryDialogContent({
  url,
  title,
  tags,
  setTags,
  roles,
  setRoles,
}) {
  useEffect(() => {
    const fetchThenSet = async () => {
      const { data } = await axios.get("/files/one", { params: { id: title } });
      const { roles: r, tags: t } = data;
      setTags(t);
      setRoles(r);
    };
    fetchThenSet().catch((e) => {
      console.log(e);
      alert(`Failed to fetch data for ${title}.`);
    });
  }, [setTags, setRoles, title]);

  return (
    <Container maxWidth="md" sx={{ paddingTop: 3 }}>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="center" flexGrow={1}>
          <Box
            sx={{ width: "50%", maxHeight: "50%" }}
            display="flex"
            justifyContent="center"
          >
            <img src={url ?? ""} alt={title ?? ""} />
          </Box>
        </Box>
        <UrlDisplay url={url} />
        <ConditionalRenderer condition="loggedInAdmin">
          <TagEditor tags={tags} setTags={setTags} />
          <RoleEditor
            roles={roles}
            setRoles={setRoles}
            enforcedRoles={["Admin"]}
          />
        </ConditionalRenderer>
      </Stack>
    </Container>
  );
}

function ImageEntry({ image, onDeleteCallback, index }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { id: title, url: img } = image;

  if (!img) {
    alert("Invalid file passed to ImageEntry.");
    return null;
  }

  const [srcUrl, srcSetUrl] = getUrls(img);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <ButtonBase onClick={handleClick}>
        <img
          src={srcUrl}
          srcSet={srcSetUrl}
          alt={title}
          loading="lazy"
          style={{
            maxWidth: "18rem",
            width: "100%",
            maxHeight: "18rem",
            height: "100%",
          }}
        />
      </ButtonBase>

      <ImageEntryDialog
        title={title}
        url={img}
        index={index}
        onDeleteCallback={onDeleteCallback}
        handleClose={handleClose}
        dialogOpen={dialogOpen}
      />
    </>
  );
}

function ImageDisplay({ images }) {
  if (!images?.data) {
    return (
      <Stack alignItems="center">
        <Typography variant="body1">Start typing to search.</Typography>
      </Stack>
    );
  }

  if (images?.data && images.data.length < 1) {
    const text = images?.data ? "No results found." : "Start typing to search.";
    return (
      <Stack alignItems="center">
        <Typography variant="body1">{text}</Typography>
      </Stack>
    );
  }

  return (
    <>
      <Masonry columns={4} spacing={2}>
        {images.data.map((image, index) => {
          image.index = index;
          const onDeleteCallback = () => {
            images.data.splice(index, 1);
          };
          return (
            <ImageEntry
              key={image.id}
              image={image}
              index={index}
              onDeleteCallback={onDeleteCallback}
            />
          );
        })}
      </Masonry>
    </>
  );
}

export default ImageDisplay;

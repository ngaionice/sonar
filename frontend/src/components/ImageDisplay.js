import {
  Button,
  ButtonBase,
  Container,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useUser } from "../contexts/userContext";
import { Masonry } from "@mui/lab";

function ImageDisplay({ images }) {
  const [user] = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [displayed, setDisplayed] = useState(null);
  const [displayIcon, setDisplayIcon] = useState(<ContentCopyIcon />);

  const ListEntry = ({ image }) => {
    const { id: title, url: img } = image;

    if (!img) {
      alert("Invalid file omitted.");
      return null;
    }

    const urlModifiers = "w=248&fit=crop&auto=format";
    const urlSetModifiers = "&dpr=2 2x";

    const extension = img.indexOf("?") === -1 ? "?" : "&";

    const srcUrl = img + extension + urlModifiers;
    const srcSetUrl = img + extension + urlModifiers + urlSetModifiers;

    const handleClick = () => {
      setDisplayed(image);
      setDialogOpen(true);
    };

    return (
      <div
        style={{
          textAlign: "center",
          display: "block",
        }}
      >
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
      </div>
    );
  };

  const UrlDisplay = () => {
    if (!displayed?.url) return null;
    const url = displayed.url;

    const handleClick = () => {
      navigator.clipboard.writeText(url).then(() => {
        setDisplayIcon(<CheckIcon />);
        setTimeout(() => setDisplayIcon(<ContentCopyIcon />), 2000);
      });
    };

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField disabled value={url} size="small" fullWidth />
        <IconButton onClick={handleClick}>{displayIcon}</IconButton>
      </Stack>
    );
  };

  const DeleteButton = () => {
    if (!displayed?.id || isNaN(displayed?.index)) return null;
    const id = displayed.id;

    const handleClick = () => {
      axios
        .delete("http://localhost:8000/api/files/delete", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          params: {
            keys: JSON.stringify([id]),
          },
        })
        .then(() => {
          images.data.splice(displayed.index, 1);
          handleClose();
        });
    };

    return (
      <Button onClick={handleClick} color="error" variant="contained">
        Delete
      </Button>
    );
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const DialogContent = () => {
    return (
      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        <Stack spacing={2}>
          <UrlDisplay />
          <DeleteButton />
        </Stack>
      </Container>
    );
  };

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
          return <ListEntry key={image.id} image={image} />;
        })}
      </Masonry>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogContent />
      </Dialog>
    </>
  );
}

export default ImageDisplay;

import {
  Button,
  ButtonBase,
  Dialog,
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useUser } from "../contexts/userContext";

function ImageDisplay({ images }) {
  const [user] = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [displayed, setDisplayed] = useState(null);
  const [displayIcon, setDisplayIcon] = useState(<ContentCopyIcon />);

  const ListEntry = ({ image }) => {
    const { id: title, url: img } = image;

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
      <ImageListItem>
        <ButtonBase onClick={handleClick}>
          <img src={srcUrl} srcSet={srcSetUrl} alt={title} loading="lazy" />
        </ButtonBase>
      </ImageListItem>
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
        <TextField disabled value={url} size="small" />
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
          images.splice(displayed.index, 1);
          handleClose();
        });
    };

    return <Button onClick={handleClick}>Delete</Button>;
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <ImageList variant="masonry" cols={3} gap={8}>
        {images.map((image, index) => {
          image.index = index;
          return <ListEntry key={image.id} image={image} />;
        })}
      </ImageList>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <Stack spacing={1}>
          <UrlDisplay />
          <DeleteButton />
        </Stack>
      </Dialog>
    </>
  );
}

export default ImageDisplay;

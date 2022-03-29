import { ImageList, ImageListItem } from "@mui/material";

function ImageDisplay({ images }) {
  const ListEntry = ({ image }) => {
    const { id: title, url: img } = image;

    const urlModifiers = "w=248&fit=crop&auto=format";
    const urlSetModifiers = "&dpr=2 2x";

    const extension = img.indexOf("?") === -1 ? "?" : "&";

    const srcUrl = img + extension + urlModifiers;
    const srcSetUrl = img + extension + urlModifiers + urlSetModifiers;

    return (
      <ImageListItem>
        <img src={srcUrl} srcSet={srcSetUrl} alt={title} loading="lazy" />
      </ImageListItem>
    );
  };

  return (
    <ImageList variant="masonry" cols={3} gap={8}>
      {images.map((image) => {
        return <ListEntry key={image.id} image={image} />;
      })}
    </ImageList>
  );
}

export default ImageDisplay;

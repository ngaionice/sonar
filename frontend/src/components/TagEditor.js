import { Chip, InputAdornment, Stack, TextField } from "@mui/material";
import StyleIcon from "@mui/icons-material/Style";
import { useLayoutEffect, useRef, useState } from "react";

function TagInserter({ tags, setTags }) {
  const handleTagInsert = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!tags.includes(e.target.value)) {
        setTags([...tags, e.target.value]);
      }
    }
  };

  return (
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
  );
}

function TagsDisplay({ tags, setTags }) {
  const stackRef = useRef();
  const [showPadding, setShowPadding] = useState(false);

  const handleTagDelete = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  useLayoutEffect(() => {
    if (stackRef.current.clientWidth < stackRef.current.scrollWidth) {
      setShowPadding(true);
    }
  }, [stackRef]);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        overflowX: "auto",
        paddingBottom: showPadding ? 1 : 0,
      }}
      ref={stackRef}
    >
      {tags.map((t, i) => (
        <Chip label={t} key={t} onDelete={() => handleTagDelete(i)} />
      ))}
    </Stack>
  );
}

function TagEditor({ tags, setTags }) {
  return (
    <Stack spacing={1}>
      <TagInserter tags={tags} setTags={setTags} />
      <TagsDisplay tags={tags} setTags={setTags} />
    </Stack>
  );
}

export default TagEditor;

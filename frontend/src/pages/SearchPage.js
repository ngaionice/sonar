import ImageSearch from "../components/ImageSearch";
import ImageDisplay from "../components/ImageDisplay";
import BasePage from "./BasePage";
import { useState } from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";

const displayModes = [
  { label: "Compact", columns: 12, spacing: 1 },
  { label: "Cozy", columns: 4, spacing: 2 },
];

function DisplayConfig({ displayMode, setDisplayMode }) {
  return (
    <ButtonGroup>
      {displayModes.map((mode) => (
        <Button
          onClick={() => setDisplayMode(mode)}
          variant={displayMode.label === mode.label ? "contained" : "outlined"}
          disableElevation
        >
          {mode.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function SearchPage({ data, setData }) {
  const [displayMode, setDisplayMode] = useState(displayModes[1]);

  return (
    <BasePage title="Search">
      <Stack direction="row" spacing={2}>
        <ImageSearch setResults={setData} />
        <DisplayConfig
          setDisplayMode={setDisplayMode}
          displayMode={displayMode}
        />
      </Stack>
      <ImageDisplay
        images={data}
        columns={displayMode.columns}
        columnSpacing={displayMode.spacing}
      />
    </BasePage>
  );
}

export default SearchPage;

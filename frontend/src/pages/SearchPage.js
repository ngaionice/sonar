import ImageSearch from "../components/ImageSearch";
import ImageDisplay from "../components/ImageDisplay";
import BasePage from "./BasePage";
import { Button, ButtonGroup, Stack } from "@mui/material";
import { imageDisplayModes, useSettings } from "../contexts/settingsContext";

function DisplayConfig() {
  const [settings, dispatchSettings] = useSettings();

  const changeMode = (payload) => {
    dispatchSettings({ type: "setImageDisplayMode", payload });
  };

  return (
    <ButtonGroup>
      {imageDisplayModes.map((mode) => (
        <Button
          onClick={() => changeMode(mode)}
          variant={
            settings.imageDisplayMode.label === mode.label
              ? "contained"
              : "outlined"
          }
          disableElevation
          key={mode.label}
        >
          {mode.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function SearchPage({ data, setData, setDisableGlobalPaste }) {
  return (
    <BasePage title="Search">
      <Stack direction="row" spacing={2}>
        <ImageSearch
          setResults={setData}
          setIsFocused={setDisableGlobalPaste}
        />
        <DisplayConfig />
      </Stack>
      <ImageDisplay images={data} />
    </BasePage>
  );
}

export default SearchPage;

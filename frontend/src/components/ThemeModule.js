import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useSettings } from "../contexts/settingsContext";

function ThemeModule() {
  const [settings, dispatchSettings] = useSettings();

  const handleClick = () => {
    dispatchSettings({ type: "setDarkMode", payload: !settings.darkMode });
  };

  return (
    <Tooltip title={"Toggle theme"} arrow>
      <IconButton onClick={handleClick}>
        {settings.darkMode ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeModule;

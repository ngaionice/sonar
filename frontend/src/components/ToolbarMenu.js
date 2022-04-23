import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import UploadForm from "./UploadForm";
import ThemeModule from "./ThemeModule";
import SettingsModule from "./SettingsModule";
import AuthButton from "./AuthButton";
import ConditionalRenderer from "./ConditionalRenderer";

function LinkIconButton({ title, to, children }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton component={Link} to={to}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

function ToolbarMenu({ disableGlobalPaste }) {
  return (
    <Stack spacing={1} direction="row">
      <ConditionalRenderer>
        <LinkIconButton title="Search" to="/search">
          <SearchIcon />
        </LinkIconButton>
      </ConditionalRenderer>

      <ConditionalRenderer condition="loggedInAdmin">
        <UploadForm allowGlobalPaste={!disableGlobalPaste} />
        <LinkIconButton title="Manage users" to="/users">
          <ManageAccountsIcon />
        </LinkIconButton>
      </ConditionalRenderer>

      <ThemeModule />
      <SettingsModule />

      <ConditionalRenderer>
        <AuthButton setLoading={() => {}} useIcon />
      </ConditionalRenderer>
    </Stack>
  );
}

export default ToolbarMenu;

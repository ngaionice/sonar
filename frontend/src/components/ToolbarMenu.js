import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import UploadForm from "./UploadForm";
import ThemeModule from "./ThemeModule";
import SettingsModule from "./SettingsModule";
import AuthButton from "./AuthButton";
import { useUser } from "../contexts/userContext";

function LinkIconButton({ title, to, children }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton component={Link} to={to}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Shows the children depending on conditions
 * @param props
 * @param props.children the React components to be conditionally rendered
 * @param props.condition possible options:
 * - 'loggedOut': shows only when logged out
 * - 'loggedIn': shows only when logged in; defaults to this if no options are passed in
 * - 'loggedInAdmin': shows only when logged in, and the logged-in user is an admin
 * @returns {null|*}
 * @constructor
 */
function ConditionalRenderer({ children, condition }) {
  const [user] = useUser();
  const renderOptions = ["loggedOut", "loggedIn", "loggedInAdmin"];
  const renderCondition = condition ?? "loggedIn";
  if (!renderOptions.includes(renderCondition)) {
    throw new Error("Invalid condition for ConditionalRenderer.");
  }

  if (renderCondition === "loggedOut") {
    if (user.isSignedIn) {
      return null;
    }
    return children;
  }

  if (!user?.tokens?.access?.token) {
    return null;
  }

  if (renderCondition === "loggedInAdmin" && !user.isAdmin) {
    return null;
  }

  return children;
}

function ToolbarMenu() {
  return (
    <Stack spacing={1} direction="row">
      <ConditionalRenderer>
        <LinkIconButton title="Search" to="/search">
          <SearchIcon />
        </LinkIconButton>
      </ConditionalRenderer>

      <ConditionalRenderer condition="loggedInAdmin">
        <UploadForm />
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

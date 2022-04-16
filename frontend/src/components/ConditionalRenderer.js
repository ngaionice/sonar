import { useUser } from "../contexts/userContext";

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

export default ConditionalRenderer;

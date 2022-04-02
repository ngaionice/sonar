import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/userContext";

function SecurityFilter({ children }) {
  let auth = useUser();
  let location = useLocation();

  if (!auth[0].token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default SecurityFilter;

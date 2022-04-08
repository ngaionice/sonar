import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/userContext";
import ErrorPage from "../pages/ErrorPage";

function SecurityFilter({ children, adminOnly }) {
  let [user] = useUser();
  let location = useLocation();

  if (!user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <ErrorPage />;
  }

  return children;
}

export default SecurityFilter;

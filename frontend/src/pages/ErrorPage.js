import BasePage from "./BasePage";
import { Typography } from "@mui/material";

function ErrorPage() {
  return (
    <BasePage title="Error">
      <Typography variant="body1">
        Either the requested resource was not found, or you are not authorized
        to view this resource.
      </Typography>
    </BasePage>
  );
}

export default ErrorPage;

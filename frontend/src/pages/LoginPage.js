import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Grid, Typography } from "@mui/material";
import AuthButton from "../components/AuthButton";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  let location = useLocation();

  let from = location.state?.from?.pathname || "/search";

  const redirect = useCallback(() => {
    navigate(from);
  }, [from, navigate]);

  return (
    <Container maxWidth="lg">
      <Grid
        container
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        minHeight="100vh"
      >
        <Grid item paddingBottom={4} paddingTop={7} marginRight="-25px">
          {/* keep value of marginRight and letterSpacing equal; old CSS bug that is still not fixed in 2022 */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 100,
              letterSpacing: "25px",
            }}
          >
            sonar
          </Typography>
        </Grid>

        <Grid item>
          <AuthButton
            loading={loading}
            setLoading={setLoading}
            redirect={redirect}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default LoginPage;

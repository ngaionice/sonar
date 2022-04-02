import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";

function AppBar({ title, children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const Title = () => (
    <Box sx={{ paddingRight: 2 }}>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );

  return (
    <>
      <MuiAppBar
        elevation={trigger ? 4 : 0}
        sx={{ backgroundColor: trigger ? "primary" : "transparent" }}
      >
        <Toolbar>
          <Title />
          {children}
        </Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
}

export default AppBar;

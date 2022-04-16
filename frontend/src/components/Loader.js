import { Box, CircularProgress } from "@mui/material";

function Loader() {
  return (
    <Box display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );
}

export default Loader;

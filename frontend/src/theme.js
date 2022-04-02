import { createTheme, responsiveFontSizes } from "@mui/material";
import { grey, orange, red } from "@mui/material/colors";

function getTheme(darkMode) {
  return responsiveFontSizes(
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          main: grey[500],
        },
        secondary: {
          main: orange[500],
        },
        error: {
          main: red[500],
        },
      },
      typography: {
        fontFamily: ["Zen Kaku Gothic Antique", "sans-serif"].join(","),
      },
      shape: { borderRadius: 12 },
      components: {
        MuiTypography: {
          defaultProps: {
            variantMapping: {
              h4: "h1",
              h5: "h2",
              h6: "h3",
            },
          },
          styleOverrides: {
            h3: { fontFamily: "Zen Kaku Gothic Antique", fontWeight: 300 },
            h4: { fontFamily: "Zen Kaku Gothic Antique", fontWeight: 300 },
            h5: { fontFamily: "Zen Kaku Gothic Antique", fontWeight: 400 },
            h6: { fontFamily: "Zen Kaku Gothic Antique", fontWeight: 400 },
            button: { fontFamily: "Zen Kaku Gothic Antique" },
            subtitle1: { fontFamily: "Zen Kaku Gothic Antique" },
            subtitle2: { fontFamily: "Zen Kaku Gothic Antique" },
            body1: { fontFamily: "Zen Kaku Gothic Antique" },
            body2: { fontFamily: "Zen Kaku Gothic Antique" },
          },
        },
      },
    })
  );
}

export default getTheme;

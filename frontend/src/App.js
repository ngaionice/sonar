import { initializeApp } from "firebase/app";
import { useRef, useState } from "react";

import { UserProvider } from "./contexts/userContext";
import AuthButton from "./components/AuthButton";
import { Route, Routes, useLocation } from "react-router-dom";
import UploadForm from "./components/UploadForm";
import AppBar from "./components/AppBar";
import {
  Box,
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
  Tooltip,
  IconButton,
} from "@mui/material";
import getTheme from "./theme";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginPage from "./pages/LoginPage";
import SecurityFilter from "./components/SecurityFilter";
import SearchPage from "./pages/SearchPage";

function initializeFirebase() {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  initializeApp(firebaseConfig);
}

function App() {
  const initialized = useRef(false);
  if (!initialized.current) {
    initializeFirebase();
    initialized.current = true;
  }

  const [data, setData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  let location = useLocation();

  const BrightnessButton = () => (
    <Tooltip title={"Toggle theme"} arrow>
      <IconButton onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={getTheme(darkMode)}>
        <UserProvider>
          <CssBaseline />
          <AppBar>
            <Box sx={{ flexGrow: 1 }} />
            <Stack spacing={1} direction="row">
              <UploadForm />
              <BrightnessButton />
              {location.pathname === "/" ? null : (
                <AuthButton setLoading={() => {}} useIcon />
              )}
            </Stack>
          </AppBar>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/search"
              element={
                <SecurityFilter>
                  <SearchPage data={data} setData={setData} />
                </SecurityFilter>
              }
            />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;

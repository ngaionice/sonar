import { initializeApp } from "firebase/app";
import { useEffect, useRef, useState } from "react";

import { UserProvider, useUser } from "./contexts/userContext";
import { Route, Routes } from "react-router-dom";
import AppBar from "./components/AppBar";
import {
  Box,
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import getTheme from "./theme";
import LoginPage from "./pages/LoginPage";
import SecurityFilter from "./components/SecurityFilter";
import SearchPage from "./pages/SearchPage";
import { SettingsProvider, useSettings } from "./contexts/settingsContext";
import ManageUsersPage from "./pages/ManageUsersPage";
import ToolbarMenu from "./components/ToolbarMenu";
import { updateInstance } from "./utilities/axios";

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

function ThemedApp({ children }) {
  const [user, setUser] = useUser();
  const [settings] = useSettings();

  useEffect(() => {
    updateInstance(settings.serverUrl, user?.tokens, setUser);
  }, [user, setUser, settings]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={getTheme(settings.darkMode)}>
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

function App() {
  const initialized = useRef(false);
  if (!initialized.current) {
    initializeFirebase();
    initialized.current = true;
  }

  const [data, setData] = useState([]);
  const [disableGlobalPaste, setDisableGlobalPaste] = useState(false);

  return (
    <UserProvider>
      <SettingsProvider>
        <ThemedApp>
          <CssBaseline />
          <AppBar>
            <Box sx={{ flexGrow: 1 }} />
            <ToolbarMenu disableGlobalPaste={disableGlobalPaste} />
          </AppBar>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/search"
              element={
                <SecurityFilter>
                  <SearchPage
                    data={data}
                    setData={setData}
                    setDisableGlobalPaste={setDisableGlobalPaste}
                  />
                </SecurityFilter>
              }
            />
            <Route
              path="/users"
              element={
                <SecurityFilter adminOnly>
                  <ManageUsersPage />
                </SecurityFilter>
              }
            />
          </Routes>
        </ThemedApp>
      </SettingsProvider>
    </UserProvider>
  );
}

export default App;

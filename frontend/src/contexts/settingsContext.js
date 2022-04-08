import { createContext, useContext, useMemo, useReducer } from "react";

const SettingsContext = createContext();

const storageVariables = {
  darkMode: "dark-mode",
  serverUrl: "server-url",
};

function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

function reducer(state, action) {
  switch (action.type) {
    case "setDarkMode":
      localStorage.setItem(
        storageVariables.darkMode,
        !!action.payload ? "dark" : "light"
      );
      return {
        ...state,
        darkMode: !!action.payload,
      };
    case "setServerUrl":
      if (typeof action.payload !== "string") {
        throw new Error("Invalid server url type. Expected type String.");
      }
      localStorage.setItem(storageVariables.serverUrl, action.payload);
      return {
        ...state,
        serverUrl: action.payload,
      };
    default:
      throw new Error("Illegal action.type for settings reducer.");
  }
}

function initializer() {
  return {
    serverUrl: localStorage.getItem(storageVariables.serverUrl) ?? "",
    darkMode: localStorage.getItem(storageVariables.darkMode) === "dark",
  };
}

function SettingsProvider(props) {
  const [settings, dispatchSettings] = useReducer(reducer, false, initializer);
  const value = useMemo(() => [settings, dispatchSettings], [settings]);
  return <SettingsContext.Provider value={value} {...props} />;
}

export { useSettings, SettingsProvider };

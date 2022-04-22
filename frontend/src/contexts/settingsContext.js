import { createContext, useContext, useMemo, useReducer } from "react";

const SettingsContext = createContext();

const storageVariables = {
  darkMode: "dark-mode",
  serverUrl: "server-url",
  imageDisplayMode: "image-display-mode",
};

const imageDisplayModes = [
  { label: "Compact", columns: 12, spacing: 1 },
  { label: "Cozy", columns: 4, spacing: 2 },
];

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
    case "setImageDisplayMode":
      if (typeof action.payload !== "object") {
        throw new Error(
          "Invalid image display mode type. Expected type Object."
        );
      }
      localStorage.setItem(
        storageVariables.imageDisplayMode,
        JSON.stringify(action.payload)
      );
      return {
        ...state,
        imageDisplayMode: action.payload,
      };
    default:
      throw new Error("Illegal action.type for settings reducer.");
  }
}

function initializer() {
  return {
    serverUrl: localStorage.getItem(storageVariables.serverUrl) ?? "",
    darkMode: localStorage.getItem(storageVariables.darkMode) === "dark",
    imageDisplayMode:
      JSON.parse(localStorage.getItem(storageVariables.imageDisplayMode)) ??
      imageDisplayModes[1],
  };
}

function SettingsProvider(props) {
  const [settings, dispatchSettings] = useReducer(reducer, false, initializer);
  const value = useMemo(() => [settings, dispatchSettings], [settings]);
  return <SettingsContext.Provider value={value} {...props} />;
}

export { useSettings, SettingsProvider, imageDisplayModes };

import { createContext, useContext, useMemo, useReducer } from "react";

function sessionReducer(state, action) {
  if (action.type === "logout") {
    action.payload = {};
  }
  if (!action.payload) {
    throw new Error("No action.payload passed to sessionReducer.");
  }
  const { tokens, name, imageUrl, isAdmin } = action.payload;
  switch (action.type) {
    case "login":
      if (!tokens) {
        throw new Error("No tokens provided when signing in.");
      }
      localStorage.setItem("tokens", JSON.stringify(tokens));
      localStorage.setItem("user", JSON.stringify({ name, imageUrl, isAdmin }));
      return { isSignedIn: true, tokens, name, imageUrl, isAdmin };
    case "logout":
      localStorage.removeItem("tokens");
      localStorage.removeItem("user");
      return { isSignedIn: false };
    case "refresh":
      localStorage.setItem("tokens", JSON.stringify(tokens));
      return {
        ...state,
        isSignedIn: true,
        tokens,
      };
    default:
      throw new Error(
        `Illegal action.type passed to sessionReducer: ${action.type}.`
      );
  }
}

function areTokensValid(tokens) {
  if (
    !tokens?.access?.token ||
    !tokens?.access?.expiry ||
    !tokens?.refresh?.token ||
    !tokens?.refresh?.expiry
  ) {
    return false;
  }
  const minLivingTime = Math.floor(Date.now() / 1000) + 60 * 60;
  return (
    tokens.access.expiry >= minLivingTime ||
    tokens.refresh.expiry >= minLivingTime + 29 * 60 * 60
  );
}

function initSession({ tokens, user }) {
  if (!tokens || !areTokensValid(tokens)) {
    return {
      isSignedIn: false,
    };
  }
  const { name, isAdmin, imageUrl } = user;
  return {
    isSignedIn: true,
    tokens,
    name,
    isAdmin,
    imageUrl,
  };
}

const UserContext = createContext();

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

function UserProvider(props) {
  const [user, dispatchUser] = useReducer(
    sessionReducer,
    {
      tokens: JSON.parse(localStorage.getItem("tokens")),
      user: JSON.parse(localStorage.getItem("user")),
    },
    initSession
  );
  const value = useMemo(() => [user, dispatchUser], [user]);
  return <UserContext.Provider value={value} {...props} />;
}

export { UserProvider, useUser };

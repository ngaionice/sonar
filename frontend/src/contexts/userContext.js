import { createContext, useContext, useMemo, useReducer } from "react";

function sessionReducer(state, action) {
  switch (action.type) {
    case "signIn":
      const { token, name, imageUrl } = action.payload;
      if (!token) {
        throw new Error("No token provided when signing in.");
      }
      return { isSignedIn: true, token, name, imageUrl };
    case "signOut":
      return { isSignedIn: false };
    default:
      throw new Error("Illegal action.type passed to sessionReducer.");
  }
}

function initSession(initialArg) {
  // read from cookies eventually to get signed in state
  return {
    isSignedIn: initialArg,
    token: null,
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
    false, // make it meaningful later for initSession
    initSession
  );
  const value = useMemo(() => [user, dispatchUser], [user]);
  return <UserContext.Provider value={value} {...props} />;
}

export { UserProvider, useUser };

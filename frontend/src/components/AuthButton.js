import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Button, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";

const login = async (auth, provider, dispatchSession, isSignUp) => {
  const result = await signInWithPopup(auth, provider);

  // TODO: handle error codes from here: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopup
  // const {code, message, email} = error;
  // const credential = GoogleAuthProvider.credentialFromError(error);
  // console.log(error);

  const imageUrl = result.user.photoURL;
  const credential = GoogleAuthProvider.credentialFromResult(result);

  const serverLoginResult = await axios.post(
    `http://localhost:8000/api/${isSignUp ? "register" : "login"}`,
    {
      token: credential.idToken,
    }
  );
  const { token, name } = serverLoginResult.data;
  dispatchSession({
    type: "signIn",
    payload: {
      token,
      name,
      imageUrl,
    },
  });
};

const logout = (auth, dispatchSession) => {
  signOut(auth)
    .then((_) => {
      dispatchSession({
        type: "signOut",
        payload: {
          isSignedIn: false,
        },
      });
    })
    .catch((err) => console.log(err));
};

const AuthButton = ({
  mode,
  dispatchSnackbar,
  disabled,
  setLoading,
  redirect,
}) => {
  const navigate = useNavigate();
  const [session, dispatchSession] = useUser();

  const useSignUp = mode === "signup";

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  provider.addScope("https://www.googleapis.com/auth/drive.appdata");

  const auth = getAuth();
  auth.useDeviceLanguage();

  const handleSignIn = () => {
    setLoading(true);
    login(auth, provider, dispatchSession, useSignUp)
      .then(() => {
        redirect();
      })
      .catch((err) => {
        let data, status;
        try {
          data = err.response.data;
          status = err.response.status;
        } catch (err) {
          data = "Unknown error";
          status = 500;
        }
        dispatchSnackbar({
          type: "open",
          payload: { message: `Error code ${status}: ${data}.` },
        });
        setLoading(false);
      });
  };

  const handleSignOut = () => {
    logout(auth, dispatchSession);
    navigate("/");
  };

  if (mode === "logoutIcon") {
    return (
      <Tooltip title={"Logout"}>
        <IconButton onClick={handleSignOut}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    );
  }

  if (session.isSignedIn) {
    return (
      <Button
        variant="contained"
        onClick={handleSignOut}
        disableElevation
        fullWidth
      >
        Logout
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      onClick={handleSignIn}
      disableElevation
      fullWidth
      disabled={disabled}
    >
      {useSignUp ? "Sign up" : "Sign in"}
    </Button>
  );
};

export default AuthButton;

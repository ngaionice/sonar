import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { IconButton, Tooltip } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { LoadingButton } from "@mui/lab";
import { useSettings } from "../contexts/settingsContext";

const login = async (auth, provider, dispatchSession, serverUrl) => {
  const result = await signInWithPopup(auth, provider);

  // TODO: handle error codes from here: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopup
  // const {code, message, email} = error;
  // const credential = GoogleAuthProvider.credentialFromError(error);
  // console.log(error);

  const imageUrl = result.user.photoURL;
  const credential = GoogleAuthProvider.credentialFromResult(result);

  const serverLoginResult = await axios.post(`${serverUrl}/api/users/login`, {
    token: credential.idToken,
  });
  const { token, name, isAdmin } = serverLoginResult.data;
  dispatchSession({
    type: "signIn",
    payload: {
      token,
      name,
      imageUrl,
      isAdmin,
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

const AuthButton = ({ loading, setLoading, useIcon, redirect }) => {
  const navigate = useNavigate();
  const [session, dispatchSession] = useUser();
  const [settings] = useSettings();

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

  const auth = getAuth();
  auth.useDeviceLanguage();

  const handleSignIn = () => {
    setLoading(true);
    login(auth, provider, dispatchSession, settings.serverUrl)
      .then(() => {
        redirect();
      })
      .catch((err) => {
        // TODO: uncomment code below and do something to handle this error?
        // let data, status;
        // try {
        //   data = err.response.data;
        //   status = err.response.status;
        // } catch (err) {
        //   data = "Unknown error";
        //   status = 500;
        // }
        setLoading(false);
      });
  };

  const handleSignOut = () => {
    logout(auth, dispatchSession);
    navigate("/");
  };

  if (useIcon) {
    return (
      <Tooltip title={session.isSignedIn ? "Logout" : "Login"} arrow>
        <IconButton onClick={session.isSignedIn ? handleSignOut : handleSignIn}>
          {session.isSignedIn ? <LogoutIcon /> : <LoginIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <LoadingButton
      variant="contained"
      loading={loading}
      onClick={session.isSignedIn ? handleSignOut : handleSignIn}
      disableElevation
    >
      {session.isSignedIn ? "Logout" : "Login"}
    </LoadingButton>
  );
};

export default AuthButton;

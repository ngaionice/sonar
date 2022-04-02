import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Button, IconButton, Tooltip } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";

import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

const login = async (auth, provider, dispatchSession) => {
  const result = await signInWithPopup(auth, provider);

  // TODO: handle error codes from here: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopup
  // const {code, message, email} = error;
  // const credential = GoogleAuthProvider.credentialFromError(error);
  // console.log(error);

  const imageUrl = result.user.photoURL;
  const credential = GoogleAuthProvider.credentialFromResult(result);

  const serverLoginResult = await axios.post(
    "http://localhost:8000/api/users/login",
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

const AuthButton = ({ setLoading, mode, redirect }) => {
  const navigate = useNavigate();
  const [session, dispatchSession] = useUser();

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

  const auth = getAuth();
  auth.useDeviceLanguage();

  const handleSignIn = () => {
    setLoading(true);
    login(auth, provider, dispatchSession)
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

  if (mode === "icon") {
    return (
      <Tooltip title={session.isSignedIn ? "Logout" : "Login"} arrow>
        <IconButton onClick={session.isSignedIn ? handleSignOut : handleSignIn}>
          {session.isSignedIn ? <LogoutIcon /> : <LoginIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      onClick={session.isSignedIn ? handleSignOut : handleSignIn}
      disableElevation
    >
      {session.isSignedIn ? "Logout" : "Login"}
    </Button>
  );
};

export default AuthButton;

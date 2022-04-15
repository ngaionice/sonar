import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import asyncHandler from "express-async-handler";
import * as Individual from "../database/user.js";
import * as Auth from "../database/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-token.js";
import { isAdmin } from "./controller-helpers.js";
import jwt from "jsonwebtoken";

// Takes in an ID token from Google OAuth, and verifies it. If valid, returns the token payload, else throws an error.
const verifyUser = async (token) => {
  const credential = GoogleAuthProvider.credential(token);
  const auth = getAuth();
  try {
    const user = await signInWithCredential(auth, credential);
    const { idToken, refreshToken, email } = user["_tokenResponse"];
    return {
      idToken,
      refreshToken,
      email,
    };
  } catch (error) {
    const errorCode = error.code;
    // const errorMessage = error.message;
    // const email = error.email;
    // const credential = GoogleAuthProvider.credentialFromError(error);
    throw new Error(
      `Could not sign in due to error code from Google: ${errorCode}`
    );
  }
};

const generateTokens = async (dbClient, email, roles) => {
  const time = Math.floor(Date.now() / 1000);
  const accessExp = time + Number(process.env.ACCESS_TOKEN_EXPIRY_SECONDS);
  const refreshExp = time + Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS);

  const tokens = {
    access: {
      token: generateAccessToken({ email, exp: accessExp, roles }),
      expiry: accessExp,
    },
    refresh: {
      token: generateRefreshToken({ email, exp: refreshExp, roles }),
      expiry: refreshExp,
    },
  };

  await dbClient.tx(async (t) => {
    const activeTokens = await Auth.getUserActiveTokenCount(t, email);
    if (activeTokens >= 10) {
      await Auth.revokeUserOldestActiveToken(t, email);
    }
    await Auth.insertToken(t, tokens.refresh.token, email);
  });

  return tokens;
};

const login = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    try {
      const authPayload = await verifyUser(token);
      const { email } = authPayload;

      const user = await Individual.findByEmail(dbClient, email);

      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      const roles = await Individual.getUserRoles(dbClient, email);
      const tokens = await generateTokens(dbClient, email, roles);

      res.status(200).json({
        tokens,
        name: user.name,
        isAdmin: isAdmin(roles),
      });
    } catch (e) {
      console.log(e);
      res.status(401).send("Invalid token");
    }
  });

const refresh = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
      res.status(401).send("Missing token");
      return;
    }

    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      const { email, roles } = data;
      const isRevoked = await dbClient.tx(async (t) => {
        const isRevoked = await Auth.isTokenRevoked(t, token);
        if (isRevoked) {
          await Auth.revokeUserSubsequentTokens(t, token, email);
          return false;
        }
        await Auth.revokeToken(t, token);
        return true;
      });

      if (isRevoked) {
        res.status(401).send("Invalid token, re-login");
        return;
      }

      const tokens = await generateTokens(dbClient, email, roles);

      res.status(200).json({
        tokens,
      });
    } catch (e) {
      console.log(e);
      res.status(401).send("Invalid token, re-login");
    }
  });

export { login, refresh };

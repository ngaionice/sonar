import asyncHandler from "express-async-handler";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import generateToken from "../utils/generate-token.js";
import * as Individual from "../database/user.js";
import { isAdmin } from "./file-controller-helpers.js";

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

const loginUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    try {
      const authPayload = await verifyUser(token);
      const { idToken, refreshToken, email } = authPayload;

      const user = await Individual.findByEmail(dbClient, email);

      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      const { email: hostEmail } = await Individual.getHost(dbClient);
      if (email === hostEmail) {
        await Individual.updateHostTokens(dbClient, idToken, refreshToken);
      }

      res.status(200).json({
        token: generateToken(user.email),
        name: user.name,
        isAdmin: email === hostEmail, // can be refactored later if permissions get implemented
      });
    } catch (e) {
      console.log(e);
      res.status(401).send("Invalid token");
    }
  });

const getAllUsers = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const users = await Individual.getAllUsers(dbClient);
    res.status(200).json({ users });
  });

const getUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (email !== req.user.email && !isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const user = await Individual.getUser(dbClient, email);
    res.status(200).json({ user });
  });

const insertUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email, name, roles } = req.body;
    await Individual.insertUser(dbClient, email, name, JSON.parse(roles));
    res.sendStatus(201);
  });

const updateUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email, name, roles } = req.body;
    await Individual.updateUser(dbClient, email, {
      name,
      roles: JSON.parse(roles),
    });
    res.sendStatus(200);
  });

const deleteUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email } = req.query;
    await Individual.deleteUser(dbClient, email);
    res.sendStatus(200);
  });

export { loginUser, getUser, getAllUsers, insertUser, updateUser, deleteUser };

// new auth flow design:
// initialize owner's email in database (in servertoken table); set other values to whatever
// on auth, if email from credential = owner's email, update servertoken's refresh + id token

// to add more users, have a table that saves emails; only these emails can login to the app (perms to be worked out)
// then only have 1 login button on screen;

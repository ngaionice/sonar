import express from "express";
import { login, refresh } from "../controllers/auth-controller.js";

const getRouter = (dbClient) => {
  const router = express.Router();

  router.post("/login", login(dbClient));
  router.post("/refresh", refresh(dbClient));
  return router;
};

export default getRouter;

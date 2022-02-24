import express from "express";
import { loginUser } from "../controllers/user-controller.js";

const getRouter = (dbClient) => {
  const router = express.Router();

  router.post("/login", loginUser(dbClient));
  return router;
};

export default getRouter;

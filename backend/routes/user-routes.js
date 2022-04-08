import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  insertUser,
  loginUser,
  updateUser,
} from "../controllers/user-controller.js";
import auth from "../middleware/auth.js";

const getRouter = (dbClient) => {
  const router = express.Router();

  router.post("/login", loginUser(dbClient));
  router.use(auth(dbClient));
  router
    .route("/user")
    .get(getUser(dbClient))
    .post(insertUser(dbClient))
    .put(updateUser(dbClient))
    .delete(deleteUser(dbClient));
  router.route("/users").get(getAllUsers(dbClient));
  return router;
};

export default getRouter;

import express from "express";
import {
  deleteUser,
  getAllRoles,
  getAllUsers,
  getUser,
  insertRole,
  insertUser,
  updateUser,
} from "../controllers/user-controller.js";
import auth from "../middleware/auth.js";

const getRouter = (dbClient) => {
  const router = express.Router();

  router.use(auth(dbClient));
  router
    .route("/one")
    .get(getUser(dbClient))
    .post(insertUser(dbClient))
    .put(updateUser(dbClient))
    .delete(deleteUser(dbClient));
  router.route("/all").get(getAllUsers(dbClient));
  router.route("/roles").get(getAllRoles(dbClient));
  router.route("/role").post(insertRole(dbClient));
  return router;
};

export default getRouter;

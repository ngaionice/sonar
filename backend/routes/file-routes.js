import express from "express";
import auth from "../middleware/auth.js";
import {
  get,
  remove,
  search,
  update,
  upload,
} from "../controllers/file-controller.js";
import multer from "multer";

const multipartHandler = multer();

const getRouter = (dbClient) => {
  const router = express.Router();

  router.use(auth(dbClient));
  router
    .route("/one")
    .get(get(dbClient))
    .post(multipartHandler.single("image"), upload(dbClient))
    .put(update(dbClient))
    .delete(remove(dbClient));
  router.get("/search", search(dbClient));
  return router;
};

export default getRouter;

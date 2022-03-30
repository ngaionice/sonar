import express from "express";
import auth from "../middleware/auth.js";
import { remove, search, upload } from "../controllers/file-controller.js";
import multer from "multer";

const multipartHandler = multer();

const getRouter = (dbClient) => {
  const router = express.Router();

  router.use(auth(dbClient));
  router.post("/upload", multipartHandler.single("image"), upload(dbClient));
  router.get("/search", search(dbClient));
  router.delete("/delete", remove(dbClient));
  return router;
};

export default getRouter;

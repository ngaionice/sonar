import asyncHandler from "express-async-handler";
import imgurUpload from "../upload/imgur-uploader.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    console.log(req.file);
    const { buffer, originalname } = req.file;
    const out = await imgurUpload(buffer, originalname);
    console.log(out);
    res.status(201).json();
  });

export { upload };

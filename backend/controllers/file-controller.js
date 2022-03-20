import asyncHandler from "express-async-handler";

import { uploadFromInternet } from "./upload-controller.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    console.log(req.file);
    // const { fileUrl } = req.body;
    // await uploadFromInternet(fileUrl, "whatever1");
    res.status(201).json();
  });

export { upload };

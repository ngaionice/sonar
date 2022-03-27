import asyncHandler from "express-async-handler";
import imgurUpload from "../upload/imgur-uploader.js";
import googleUpload from "../upload/google-uploader.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    // console.log(req.file);
    const { buffer, size, mimetype } = req.file;
    const { tags: tagsString, isPublic } = req.body;
    const tags = tagsString ? JSON.parse(tagsString) : [];
    if (tags.length < 1) {
      tags.push("untagged");
    }
    console.log(tags);
    console.log(isPublic);

    const allowedTypesPrefix = /image\//;
    if (mimetype.search(allowedTypesPrefix) !== 0) {
      res.status(400).send("Invalid file type");
      return;
    }

    if (size > 15728640) {
      res.status(400).send("File too large");
      return;
    }

    const googleData = await googleUpload(buffer);
    if (isPublic) {
      const imgurData = await imgurUpload(buffer);
      console.log(imgurData);
    }

    res.status(201).json();
  });

export { upload };

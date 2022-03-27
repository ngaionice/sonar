import asyncHandler from "express-async-handler";
import imgurUpload from "../upload/imgur-uploader.js";
import awsUpload from "../upload/aws-uploader.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { buffer, size, mimetype, originalname } = req.file;
    const { tags: tagsString, isPublic } = req.body;
    const tags = tagsString ? JSON.parse(tagsString) : [];
    if (tags.length < 1) {
      tags.push("untagged");
    }

    const allowedTypesPrefix = /image\//;
    if (mimetype.search(allowedTypesPrefix) !== 0) {
      res.status(400).send("Invalid file type");
      return;
    }

    if (size > 15728640) {
      res.status(400).send("File too large");
      return;
    }

    const locations = {};

    locations.aws = await awsUpload(buffer, originalname);

    if (isPublic) {
      locations.imgur = await imgurUpload(buffer);
    }

    res.status(201).json(locations);
  });

export { upload };

import asyncHandler from "express-async-handler";
import imgurUpload from "../upload/imgur-uploader.js";
import awsUpload from "../upload/aws-uploader.js";
import {
  insertImage,
  insertImageCache,
  insertImageTags,
} from "../database/file.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { buffer, size, mimetype, originalname: oldName } = req.file;
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

    const out = {};

    const name = String(Math.floor(Date.now() / 1000)).concat("-", oldName);
    const { key, url: awsUrl } = await awsUpload(buffer, name);
    out.aws = awsUrl;

    await insertImage(dbClient, key, awsUrl, !!isPublic);
    await insertImageTags(dbClient, key, tags);

    if (isPublic) {
      const { url: imgurUrl, deleteHash: imgurDeleteHash } = await imgurUpload(
        buffer
      );
      out.imgur = imgurUrl;
      await insertImageCache(dbClient, key, imgurUrl, imgurDeleteHash);
    }

    res.status(201).json(out);
  });

export { upload };

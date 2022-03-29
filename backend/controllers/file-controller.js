import asyncHandler from "express-async-handler";
import imgurUpload from "../storage/imgur-manager.js";
import {
  upload as awsUpload,
  download as awsDownload,
} from "../storage/aws-manager.js";
import {
  insertImage,
  insertImageCache,
  insertImageTags,
  searchImagesByTag,
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

const search = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { term, mode } = req.query;
    const results = await searchImagesByTag(dbClient, term, Number(mode));
    res.status(200).json(results);
  });

const download = () =>
  asyncHandler(async (req, res) => {
    const { key } = req.query;
    const stream = awsDownload(key);
    stream.pipe(res);
  });

export { upload, download, search };

import asyncHandler from "express-async-handler";
import * as Imgur from "../storage/imgur-manager.js";
import * as AWS from "../storage/aws-manager.js";
import * as File from "../database/file.js";

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
    const { key, url: awsUrl } = await AWS.upload(buffer, name);
    out.aws = awsUrl;

    await File.insertImage(dbClient, key, awsUrl, !!isPublic);
    await File.insertImageTags(dbClient, key, tags);

    if (isPublic) {
      const { url: imgurUrl, deleteHash: imgurDeleteHash } = await Imgur.upload(
        buffer
      );
      out.imgur = imgurUrl;
      await File.insertImageCache(dbClient, key, imgurUrl, imgurDeleteHash);
    }

    res.status(201).json(out);
  });

const search = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { term, mode } = req.query;
    const results = await File.searchImagesByTag(dbClient, term, Number(mode));
    const expiry = String(Math.floor(Date.now() / 1000));
    results.forEach((r) => {
      if (!r.usecache) {
        // generate a temporary URL if the file is not set to be shared to the public via Imgur
        r.url = AWS.generateSignedUrl(r.id);
      }
    });
    res.status(200).json({ expiry, data: results });
  });

const remove = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { keys: keysString } = req.query;
    const keys = JSON.parse(keysString);
    if (!Array.isArray(keys)) {
      res.status(400).message("Invalid keys.");
      return;
    }

    await AWS.remove(keys);
    const hashes = (await File.getHashesByKeys(dbClient, keys)).map(
      (o) => o.deletehash
    );
    await Imgur.remove(hashes);

    await File.deleteImagesByKey(dbClient, keys);
    res.status(200);
  });

export { upload, search, remove };

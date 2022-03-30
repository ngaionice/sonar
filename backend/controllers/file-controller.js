import asyncHandler from "express-async-handler";
import * as Imgur from "../storage/imgur-manager.js";
import * as AWS from "../storage/aws-manager.js";
import * as File from "../database/file.js";
import axios from "axios";

const getTags = (tagsString) => {
  let tags;
  if (tagsString) {
    const temp = JSON.parse(tagsString);
    tags = Array.isArray(temp) ? temp : [];
  } else {
    tags = [];
  }
  if (tags.length < 1) {
    tags.push("untagged");
  }
  return tags;
};

const getNewFilename = (filename) =>
  String(Math.floor(Date.now() / 1000)).concat("-", filename ?? "autoname");

const isValidFiletype = (type) => {
  const allowedTypesPrefix = /image\//;
  return type.search(allowedTypesPrefix) !== 0;
};

const getDataFromUpload = (req, res) => {
  const { buffer, size, mimetype, originalname: oldName } = req.file;
  const { tags: tagsString, isPublic } = req.body;

  if (!isValidFiletype(mimetype)) {
    res.status(400).send("Invalid file type");
    throw new Error("Invalid file type");
  }

  if (size > 15728640) {
    res.status(400).send("File too large");
    throw new Error("File too large");
  }

  const tags = getTags(tagsString);
  const name = getNewFilename(oldName);
  return {
    buffer,
    name,
    tags,
    isPublic,
  };
};

const getDataFromUrl = async (req, res) => {
  const { tags: tagsString, isPublic, srcUrl } = req.body;
  const tags = getTags(tagsString);

  const image = await axios.get(srcUrl, {
    responseType: "arraybuffer",
    timeout: 30000, // times out after 30s
  });
  if (!isValidFiletype(image.headers["content-type"])) {
    res.status(400).send("Invalid file type");
    throw new Error("Invalid file type");
  }
  if (image.data.byteLength > 15728640) {
    res.status(400).send("File too large");
    throw new Error("File too large");
  }

  const buffer = Buffer.from(image.data, "utf-8");

  const name = getNewFilename();

  return {
    buffer,
    name,
    tags,
    isPublic,
  };
};

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    let data;
    try {
      if (req.file) data = getDataFromUpload(req, res);
      else data = await getDataFromUrl(req, res);
    } catch (e) {
      console.log("Failed data extraction.");
      return;
    }
    const { buffer, name, tags, isPublic } = data;

    const out = {};

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

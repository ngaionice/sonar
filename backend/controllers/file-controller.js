import asyncHandler from "express-async-handler";
import * as Imgur from "../storage/imgur-manager.js";
import * as AWS from "../storage/aws-manager.js";
import * as File from "../database/file.js";
import { getAllRoles } from "../database/user.js";
import {
  getDataFromUpload,
  getDataFromUrl,
  getRolesValue,
  getTags,
  isAdmin,
} from "./controller-helpers.js";

const upload = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }

    let data;
    try {
      if (req.file) data = getDataFromUpload(req, res);
      else data = await getDataFromUrl(req, res);
    } catch (e) {
      console.log("Failed data extraction.");
      return;
    }
    const { buffer, name, tags, readRoles, isPublic } = data;
    console.log(data);

    const out = {};

    const { key, url: awsUrl } = await AWS.upload(buffer, name);
    out.aws = awsUrl;

    let readRolesVal = 1;
    const rolesArray = await getAllRoles(dbClient);
    readRoles.forEach((role) => {
      for (const roleObj of rolesArray) {
        if (role === roleObj.title) {
          readRolesVal *= roleObj.id;
          break;
        }
      }
    });

    try {
      await File.insertImage(dbClient, key, awsUrl, !!isPublic, readRolesVal);
      if (tags.length > 0) {
        await File.insertImageTags(dbClient, key, tags);
      }
    } catch (e) {
      console.log("Tag insertion failed.");
      console.log(e);
      await AWS.remove([key]);
      res.status(500).send("Database issue");
      return;
    }

    if (isPublic) {
      try {
        const { url: imgurUrl, deleteHash: imgurDeleteHash } =
          await Imgur.upload(buffer);
        out.imgur = imgurUrl;
        await File.insertImageCache(dbClient, key, imgurUrl, imgurDeleteHash);
      } catch (e) {
        await AWS.remove([key]);
        await File.deleteImagesByKey(dbClient, [key]);
        console.log("Imgur upload failed.");
        console.log(e);
        res.status(500).send("Imgur issue");
        return;
      }
    }

    res.status(201).json(out);
  });

const search = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { term } = req.query;
    // TODO: in the future, update file search statement so we can union all images this user can access
    const results = await File.searchImagesByTag(
      dbClient,
      term,
      req.user.roles ?? []
    );
    const expiry = String(Math.floor(Date.now() / 1000));
    results.forEach((r) => {
      if (!r.usecache) {
        // generate a temporary URL if the file is not set to be shared to the public via Imgur
        r.url = AWS.generateSignedUrl(r.id);
      }
    });
    res.status(200).json({ expiry, data: results });
  });

const get = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { id } = req.query;
    const roles = await File.getImageReadRoles(dbClient, id);
    const tags = await File.getImageTags(dbClient, id);
    res.status(200).json({ roles, tags });
  });

const update = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { id, readRoles: readRolesString, tags: tagsString } = req.body;
    const readRoles = await getRolesValue(readRolesString);
    await File.updateImageReadRoles(dbClient, id, readRoles);

    const existingTags = await File.getImageTags(dbClient, id);
    const newTags = getTags(tagsString);

    const toAdd = newTags.map((tag) => !existingTags.includes(tag));
    const toDelete = existingTags.map((tag) => !newTags.includes(tag));

    await File.insertImageTags(dbClient, id, toAdd);
    await File.deleteImageTags(dbClient, id, toDelete);

    res.sendStatus(200);
  });

const remove = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { keys: keysString } = req.query;

    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }

    const keys = JSON.parse(keysString);
    if (!Array.isArray(keys)) {
      res.status(400).send("Invalid keys.");
      return;
    }

    await AWS.remove(keys);
    const hashes = (await File.getHashesByKeys(dbClient, keys)).map(
      (o) => o.deletehash
    );
    await Imgur.remove(hashes);

    await File.deleteImagesByKey(dbClient, keys);
    res.sendStatus(200);
  });

export { upload, search, remove, get, update };

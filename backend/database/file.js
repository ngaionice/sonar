import {
  deleteImagesByKeyStmt,
  deleteImageTagsStmt,
  getImageReadRolesStmt,
  getImageTagsStmt,
  insertImageCacheStmt,
  insertImageStmt,
  searchImagesStmt,
  selectHashesByKeyStmt,
  updateImageReadRolesStmt,
} from "./statements/file-statements.js";

import pgpUninitialized from "pg-promise";

const pgp = pgpUninitialized();
const imageTagCols = new pgp.helpers.ColumnSet(["imageid", "tag"], {
  table: "imagetag",
});

async function insertImage(client, key, url, isPublic, readRoles) {
  await client.none(insertImageStmt, [key, url, isPublic, readRoles]);
}

async function insertImageCache(client, key, url, deleteHash) {
  await client.none(insertImageCacheStmt, [key, url, deleteHash]);
}

async function insertImageTags(client, key, tags) {
  const values = tags.map((v) => ({
    imageid: key,
    tag: v,
  }));
  const query = pgp.helpers.insert(values, imageTagCols);
  await client.none(query);
}

async function deleteImageTags(client, key, tags) {
  const rawValues = tags.map((v) => ({
    imageid: key,
    tag: v,
  }));
  const values = pgp.helpers.values(rawValues, ["imageid", "tag"]);
  await client.none(deleteImageTagsStmt, [values]);
}

/**
 * Returns an array of role names.
 * @param client
 * @param {string} imageId
 * @returns {Promise<string[]>}
 */
async function getImageReadRoles(client, imageId) {
  return await client.map(getImageReadRolesStmt, [imageId], (row) => row.title);
}

/**
 * Returns an array of image tags.
 * @param client
 * @param {string} imageId
 * @returns {Promise<string[]>}
 */
async function getImageTags(client, imageId) {
  return await client.map(getImageTagsStmt, [imageId], (row) => row.tag);
}

async function updateImageReadRoles(client, imageId, readRoleValue) {
  await client.none(updateImageReadRolesStmt, [imageId, readRoleValue]);
}

/**
 *
 * @param client
 * @param {string} tag
 * @param {number[]} role The role ids of the user
 * @return {Promise<any[]>}
 */
async function searchImagesByTag(client, tag, role) {
  return await client.manyOrNone(searchImagesStmt, [tag, role[0]]); // TODO: in future, union this or something to search with multiple roles at once
}

/**
 *
 * @param client
 * @param {string[]} keys An array of keys.
 * @return {Promise<*>}
 */
async function deleteImagesByKey(client, keys) {
  if (keys.length === 0) return;
  return await client.none(deleteImagesByKeyStmt, [keys]);
}

/**
 *
 * @param client
 * @param {string[]} keys An array of keys.
 */
async function getHashesByKeys(client, keys) {
  if (keys.length === 0) return;
  return await client.manyOrNone(selectHashesByKeyStmt, [keys]);
}

export {
  deleteImagesByKey,
  deleteImageTags,
  getHashesByKeys,
  getImageReadRoles,
  getImageTags,
  insertImage,
  insertImageCache,
  insertImageTags,
  searchImagesByTag,
  updateImageReadRoles,
};

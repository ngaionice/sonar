import {
  deleteImagesByKeyStmt,
  getImageRolesStmt,
  getImageTagsStmt,
  insertImageCacheStmt,
  insertImageStmt,
  searchImagesStmt,
  selectHashesByKeyStmt,
} from "./statements/file-statements.js";

import pgpUninitialized from "pg-promise";

async function insertImage(client, key, url, isPublic, readRoles) {
  await client.none(insertImageStmt, [key, url, isPublic, readRoles]);
}

async function insertImageCache(client, key, url, deleteHash) {
  await client.none(insertImageCacheStmt, [key, url, deleteHash]);
}

async function insertImageTags(client, key, tags) {
  const pgp = pgpUninitialized();
  const cols = new pgp.helpers.ColumnSet(["imageid", "tag"], {
    table: "imagetag",
  });
  const values = tags.map((v) => ({
    imageid: key,
    tag: v,
  }));
  const query = pgp.helpers.insert(values, cols);
  await client.none(query);
}

/**
 * Returns an array of role names.
 * @param client
 * @param {string} imageId
 * @returns {Promise<string[]>}
 */
async function getImageRoles(client, imageId) {
  return await client.map(getImageRolesStmt, [imageId], (row) => row.title);
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
  getHashesByKeys,
  getImageRoles,
  getImageTags,
  insertImage,
  insertImageCache,
  insertImageTags,
  searchImagesByTag,
};

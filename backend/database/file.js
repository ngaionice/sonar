import {
  insertImageCacheStmt,
  insertImageStmt,
  searchImagesApproximateStmt,
  searchImagesExactStmt,
  searchImagesInsensitiveStmt,
} from "./statements/file-statements.js";

import pgpUninitialized from "pg-promise";

async function insertImage(client, key, url, isPublic) {
  await client.none(insertImageStmt, [key, url, isPublic]);
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
 *
 * @param client
 * @param {string} tag
 * @param {number} mode An integer to indicate which mode to use.
 * - 0 for exact match for the input
 * - 1 for case-insensitive match for the input
 * - 2 for case-insensitive and/or starts with the input
 * @return {Promise<any[]>}
 */
async function searchImagesByTag(client, tag, mode) {
  let stmt;

  switch (mode) {
    case 0:
      stmt = searchImagesExactStmt;
      break;
    case 1:
      stmt = searchImagesInsensitiveStmt;
      break;
    case 2:
      stmt = searchImagesApproximateStmt;
      break;
    default:
      throw new Error("Invalid argument.");
  }
  return await client.manyOrNone(stmt, [tag]);
}

export { insertImage, insertImageCache, insertImageTags, searchImagesByTag };

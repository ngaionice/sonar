/**
 * Params:
 * 1. id
 * 2. url
 * 3. useCache
 */
const insertImageStmt =
  "insert into Image (id, mainUrl, useCache) values ($1, $2, $3)";

/**
 * Params:
 * 1. imageId
 * 2. cacheUrl
 * 3. deleteHash
 */
const insertImageCacheStmt =
  "insert into ImageCache (imageId, cacheUrl, deleteHash) values ($1, $2, $3)";

export { insertImageStmt, insertImageCacheStmt };

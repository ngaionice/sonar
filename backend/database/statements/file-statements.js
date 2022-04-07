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

/**
 * Returns the following fields:
 * - `id`
 * - `usecache`
 * - `url`
 *
 * Params:
 * 1. search term
 * 2. user's role id
 *
 * Search for images with a tag the starts with the search term, and is case-insensitive
 */
const searchImagesApproximateStmt =
  "select distinct i.id, useCache, cacheUrl as url from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag ilike concat($1, '%') and mod(i.readroles, $2) = 0";

/**
 * Returns the following fields:
 * - `id`
 * - `usecache`
 * - `url`
 *
 * Params:
 * 1. search term
 * 2. user's role id
 *
 * Search for images with a tag matching the search term, case-insensitive
 */
const searchImagesInsensitiveStmt =
  "select distinct i.id, useCache, cacheUrl as url from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag ilike $1 and mod(i.readroles, $2) = 0";

/**
 * Returns the following fields:
 * - `id`
 * - `usecache`
 * - `url`
 *
 * Params:
 * 1. search term
 * 2. user's role id
 *
 * Search for images with a tag matching the search term, case-sensitive
 */
const searchImagesExactStmt =
  "select distinct i.id, useCache, cacheUrl as url from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag = $1 and mod(i.readroles, $2) = 0";

/**
 * Params:
 * 1. list of image ids/keys
 */
const selectHashesByKeyStmt =
  "select deleteHash from Image i join ImageCache ic on i.id = ic.imageId where i.id in ($1:csv)";

/**
 * Params:
 * 1. list of image ids/keys
 */
const deleteImagesByKeyStmt = "delete from Image where id in ($1:csv)";

export {
  insertImageStmt,
  insertImageCacheStmt,
  searchImagesApproximateStmt,
  searchImagesInsensitiveStmt,
  searchImagesExactStmt,
  selectHashesByKeyStmt,
  deleteImagesByKeyStmt,
};

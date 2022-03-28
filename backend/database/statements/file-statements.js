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
 * Params:
 * 1. search term
 *
 * Search for images with a tag the starts with the search term, and is case-insensitive
 */
const searchImagesApproximateStmt =
  "select i.id, mainUrl, useCache, cacheUrl, deleteHash, tag from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag ilike concat($1, '%')";

const searchImagesInsensitiveStmt =
  "select i.id, mainUrl, useCache, cacheUrl, deleteHash, tag from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag ilike $1";

const searchImagesExactStmt =
  "select i.id, mainUrl, useCache, cacheUrl, deleteHash, tag from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where it.tag = $1";

export {
  insertImageStmt,
  insertImageCacheStmt,
  searchImagesApproximateStmt,
  searchImagesInsensitiveStmt,
  searchImagesExactStmt,
};

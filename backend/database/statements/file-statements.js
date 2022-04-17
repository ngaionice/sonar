/**
 * Params:
 * 1. id
 * 2. url
 * 3. useCache
 */
const insertImageStmt =
  "insert into Image (id, mainUrl, useCache, readRoles, createdAt) values ($1, $2, $3, $4, current_timestamp)";

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
 * Case-insensitive search for images with
 * - a single-word tag that starts with the search term, or
 * - a multi-word tag with at least 1 word starting with the search term
 */
const searchImagesStmt =
  "select distinct i.id, useCache, cacheUrl as url from Image i left join ImageCache ic on i.id = ic.imageId join ImageTag it on i.id = it.imageId where mod(i.readroles, $2) = 0 and it.tag ilike any (array[concat($1, '%'), concat('%_ ',$1)])";

/**
 * Returns role titles for roles that can divide the read role value of the input image id.
 *
 * Params:
 * 1. image id
 */
const getImageRolesStmt =
  "select r.title from Role r where mod((select readroles from Image i where i.id = $1), r.id) = 0";

/**
 * Returns image tags for the input image id.
 *
 * Params:
 * 1. image id
 */
const getImageTagsStmt = "select tag from ImageTag where imageId = $1";

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
  getImageRolesStmt,
  getImageTagsStmt,
  insertImageStmt,
  insertImageCacheStmt,
  searchImagesStmt,
  selectHashesByKeyStmt,
  deleteImagesByKeyStmt,
};

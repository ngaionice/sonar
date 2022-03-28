import {
  insertImageCacheStmt,
  insertImageStmt,
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

export { insertImage, insertImageCache, insertImageTags };

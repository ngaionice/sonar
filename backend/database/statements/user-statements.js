/**
 * Params:
 * 1. email
 */
const findByEmailStmt = "select * from Individual where email = $1";

const getHostStmt = "select * from ServerToken";

const getRolesStmt =
  "select r.id from Role r join IndividualRole ir on r.title = ir.title where ir.email = $1";

/**
 * Params:
 * 1. email
 * 2. name
 */
const insertStmt = "insert into Individual (email, name) values ($1, $2)";

/**
 * Params:
 * 1. idToken
 */
const updateIdTokenStmt = "update ServerToken set idToken = $1 where true";

/**
 * Params:
 * 1. idToken
 * 2. refreshToken
 */
const updateHostTokensStmt =
  "update ServerToken set idToken = $1, refreshToken = $2 where true";

export {
  findByEmailStmt,
  getHostStmt,
  getRolesStmt,
  insertStmt,
  updateIdTokenStmt,
  updateHostTokensStmt,
};

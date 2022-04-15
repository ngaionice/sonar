/**
 * Params:
 * 1. token
 * @type {string}
 */
const isTokenRevokedStmt =
  "select email from RefreshToken where token = $1 and revoked = true";

/**
 * Params:
 * 1. token
 * @type {string}
 */
const revokeTokenStmt =
  "update RefreshToken set revoked = true where token = $1";

/**
 * Params:
 * 1. email
 * @type {string}
 */
const getUserActiveTokenCountStmt =
  "select count(*) from RefreshToken where email = $1 and revoked = false";

/**
 * Params:
 * 1. email
 * @type {string}
 */
const revokeUserOldestActiveTokenStmt =
  "update RefreshToken set revoked = true where email = $1 and createdAt <= (select createdAt from RefreshToken where email = $1 and revoked = false order by createdAt limit 1)";

/**
 * Params:
 * 1. email
 * 2. token
 * @type {string}
 */
const revokeUserSubsequentTokensStmt =
  "update RefreshToken set revoked = true where email = $1 and createdAt >= any (select createdAt from RefreshToken where token = $2)";

/**
 * Params:
 * 1. email
 * 2. token
 * @type {string}
 */
const insertTokenStmt =
  "insert into RefreshToken (token, email) values ($2, $1)";

export {
  revokeUserOldestActiveTokenStmt,
  getUserActiveTokenCountStmt,
  isTokenRevokedStmt,
  revokeTokenStmt,
  revokeUserSubsequentTokensStmt,
  insertTokenStmt,
};

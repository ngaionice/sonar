import * as Auth from "./statements/auth-statements.js";

async function revokeUserOldestActiveToken(client, email) {
  await client.none(Auth.revokeUserOldestActiveTokenStmt, [email]);
}

/**
 *
 * @param client
 * @param email
 * @returns {Promise<Number>} If resolved, number of active tokens associated with this email.
 */
async function getUserActiveTokenCount(client, email) {
  const raw = await client.one(Auth.getUserActiveTokenCountStmt, [email]);
  return raw.count;
}

/**
 * Returns true if the token is revoked, false otherwise.
 * @param client
 * @param token
 * @returns {Promise<boolean>}
 */
async function isTokenRevoked(client, token) {
  return await client.oneOrNone(Auth.isTokenRevokedStmt, [token]);
}

async function revokeToken(client, token) {
  await client.none(Auth.revokeTokenStmt, [token]);
}

async function revokeUserSubsequentTokens(client, token, email) {
  await client.none(Auth.revokeUserSubsequentTokensStmt, [email, token]);
}

async function insertToken(client, token, email) {
  await client.none(Auth.insertTokenStmt, [email, token]);
}

export {
  revokeUserOldestActiveToken,
  getUserActiveTokenCount,
  isTokenRevoked,
  revokeToken,
  revokeUserSubsequentTokens,
  insertToken,
};

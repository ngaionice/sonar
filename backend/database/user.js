import {
  findByEmailStmt,
  getHostStmt,
  getRolesStmt,
  insertStmt,
  updateHostTokensStmt,
  updateIdTokenStmt,
} from "./statements/user-statements.js";

async function findByEmail(client, email) {
  return await client.oneOrNone(findByEmailStmt, [email]);
}

async function getRoles(client, email) {
  return await client.manyOrNone(getRolesStmt, [email]);
}

async function getHost(client) {
  return await client.one(getHostStmt);
}

async function insert(client, email, name) {
  await client.none(insertStmt, [email, name]);
}

async function updateIdToken(client, idToken) {
  await client.none(updateIdTokenStmt, [idToken]);
}

async function updateHostTokens(client, idToken, refreshToken) {
  await client.none(updateHostTokensStmt, [idToken, refreshToken]);
}

export {
  getHost,
  getRoles,
  findByEmail,
  insert,
  updateIdToken,
  updateHostTokens,
};

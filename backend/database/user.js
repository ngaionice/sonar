import {
  deleteUserRolesStmt,
  deleteUserStmt,
  findByEmailStmt,
  getAllRolesStmt,
  getAllUsersStmt,
  getUserRolesStmt,
  getUserStmt,
  insertRoleStmt,
  insertUserRoleStmt,
  insertUserStmt,
  updateUserNameStmt,
} from "./statements/user-statements.js";

/**
 * Returns an object containing the user's:
 * - `name`: name of the user
 * - `email`: email of the user
 * @param client
 * @param email
 * @return {Promise<any>}
 */
async function findByEmail(client, email) {
  return await client.oneOrNone(findByEmailStmt, [email]);
}

async function getUserRoles(client, email) {
  const raw = await client.manyOrNone(getUserRolesStmt, [email]);
  return raw.map((v) => v.id);
}

/**
 * Returns a list of all roles, sorted by the value of the role id (descending)
 * @param client
 * @return {Promise<*|any[]>}
 */
async function getAllRoles(client) {
  return await client.many(getAllRolesStmt);
}

/**
 * Returns an array of user objects, each containing a user object with the following fields:
 * - `email`: string
 * - `name`: string
 * - `roles`: array of strings
 *
 * @param client
 * @return {Promise<{}>}
 */
async function getAllUsers(client) {
  const rawUsers = await client.many(getAllUsersStmt);
  const users = {};
  rawUsers.forEach((row) => {
    const { email, name, role } = row;
    if (users[email]) {
      users[email].roles.push(role);
    } else {
      users[email] = {};
      users[email].name = name;
      users[email].roles = role ? [role] : [];
    }
  });
  return users;
}

/**
 * Returns a user object containing the following fields:
 * - `email`: string
 * - `name`: string
 * - `roles`: array of strings
 *
 * @param client
 * @param email
 * @return {Promise<{}>}
 */
async function getUser(client, email) {
  const raw = await client.manyOrNone(getUserStmt, [email]);
  const user = {};
  raw.forEach((row) => {
    if (!user.email) {
      user.email = row.email;
      user.name = row.name;
      user.roles = row.role ? [row.role] : [];
    } else {
      user.roles.push(row.role);
    }
  });
  return user;
}

/**
 *
 * @param client
 * @param {string} email
 * @param {string} name
 * @param {string[]} roles
 * @return {Promise<void>}
 */
async function insertUser(client, email, name, roles) {
  await client.tx("insert-user", async (t) => {
    await t.none(insertUserStmt, [email, name]);
    for (const r of roles) {
      await t.none(insertUserRoleStmt, [email, r]);
    }
  });
}

async function insertRole(client, title, id) {
  await client.none(insertRoleStmt, [title, id]);
}

/**
 *
 * @param client
 * @param email
 * @param {object} changes An object containing the changes to be made.
 * @param {string} changes.name If included, the user's name will be updated.
 * @param {string[]} changes.roles If included, the user's roles will be updated to those in the array.
 * @return {Promise<void>}
 */
async function updateUser(client, email, changes) {
  await client.tx("update-user", async (t) => {
    if (changes.name) {
      await t.none(updateUserNameStmt, [email, changes.name]);
    }
    if (changes.roles) {
      await t.none(deleteUserRolesStmt, [email]);
      for (const r of changes.roles) {
        await t.none(insertUserRoleStmt, [email, r]);
      }
    }
  });
}

async function deleteUser(client, email) {
  await client.none(deleteUserStmt, [email]);
}

export {
  deleteUser,
  getAllRoles,
  getAllUsers,
  getUserRoles,
  getUser,
  findByEmail,
  insertRole,
  insertUser,
  updateUser,
};

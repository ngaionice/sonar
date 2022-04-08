/**
 * Params:
 * 1. email
 */
const findByEmailStmt = "select * from Individual where email = $1";

const getHostStmt = "select * from ServerToken";

const getRolesStmt =
  "select r.id from Role r join IndividualRole ir on r.title = ir.title where ir.email = $1";

const getAllUsersStmt =
  "select i.email, i.name, r.title as role from Individual i join IndividualRole ir on i.email = ir.email join Role r on ir.title = r.title";

/**
 * Params:
 * 1. email
 */
const getUserStmt =
  "select i.email, i.name, r.title as role from Individual i join IndividualRole ir on i.email = ir.email join Role r on ir.title = r.title where i.email = $1";

/**
 * Params:
 * 1. email
 * 2. name
 */
const insertUserStmt = "insert into Individual (email, name) values ($1, $2)";

/**
 * Params:
 * 1. email
 * 2. role name
 */
const insertUserRoleStmt =
  "insert into IndividualRole (email, title) values ($1, $2)";

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

/**
 * Params:
 * 1. email
 * 2. name
 */
const updateUserNameStmt = "update Individual set name = $2 where email = $1";

/**
 * Params:
 * 1. email
 */
const deleteUserStmt = "delete from Individual where email = $1";

/**
 * Params:
 * 1. email
 */
const deleteUserRolesStmt = "delete from IndividualRole where email = $1";

export {
  deleteUserStmt,
  deleteUserRolesStmt,
  findByEmailStmt,
  getAllUsersStmt,
  getHostStmt,
  getRolesStmt,
  getUserStmt,
  insertUserStmt,
  insertUserRoleStmt,
  updateIdTokenStmt,
  updateHostTokensStmt,
  updateUserNameStmt,
};

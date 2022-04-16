import asyncHandler from "express-async-handler";
import * as Individual from "../database/user.js";
import { getNextPrime, isAdmin } from "./controller-helpers.js";

const getAllRoles = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const rawRoles = await Individual.getAllRoles(dbClient);
    const roles = rawRoles.map((r) => r.title);
    res.status(200).json({ roles });
  });

const getAllUsers = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const users = await Individual.getAllUsers(dbClient);
    res.status(200).json({ users });
  });

const getUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (email !== req.user.email && !isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const user = await Individual.getUserWithRoles(dbClient, email);
    res.status(200).json({ user });
  });

const insertRole = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { name } = req.body;
    const currRoles = await Individual.getAllRoles(dbClient);
    if (currRoles.length > 200) {
      res.status(500).message("Only 200 roles are allowed at a time.");
      return;
    }
    const nextPrime = getNextPrime(new Set(currRoles.map((role) => role.id)));

    await Individual.insertRole(dbClient, name, nextPrime);
    res.sendStatus(201);
  });

const insertUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email, name, roles } = req.body;
    await Individual.insertUser(dbClient, email, name, roles);
    res.sendStatus(201);
  });

const updateUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email, name, roles } = req.body;
    await Individual.updateUser(dbClient, email, {
      name,
      roles,
    });
    res.sendStatus(200);
  });

const deleteUser = (dbClient) =>
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.roles)) {
      res.sendStatus(401);
      return;
    }
    const { email } = req.query;
    await Individual.deleteUser(dbClient, email);
    res.sendStatus(200);
  });

export {
  getUser,
  getAllUsers,
  getAllRoles,
  insertRole,
  insertUser,
  updateUser,
  deleteUser,
};

import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import * as User from "../database/user.js";

const verifyToken = (dbClient) =>
  asyncHandler(async (req, res, next) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.getUserWithoutRoles(dbClient, decoded.email);
        const roles = await User.getUserRoles(dbClient, decoded.email);

        if (!user) {
          res.status(401).message("Unauthorized.");
          return;
        } else {
          req.user = user;
          req.user.roles = roles || [];
        }

        next();
      } catch {
        res.status(401);
        throw new Error("Invalid token.");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Missing authorization.");
    }
  });

export default verifyToken;

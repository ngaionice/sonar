import jwt from "jsonwebtoken";

const generateAccessToken = ({ email, exp, roles }) => {
  return jwt.sign({ email, exp, roles }, process.env.JWT_SECRET);
};

const generateRefreshToken = ({ email, exp, roles, salt }) => {
  return jwt.sign({ email, exp, roles, salt }, process.env.JWT_SECRET);
};

export { generateAccessToken, generateRefreshToken };

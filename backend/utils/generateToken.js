import jwt from "jsonwebtoken";

const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

export default generateToken;

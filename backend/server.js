import express from "express";
import dotenv from "dotenv";

import getDatabaseClient from "./clients/database-client.js";

dotenv.config();

const app = express();
const client = await getDatabaseClient();

app.get("/health", (req, res) => {
  res.status(200).json(new Date());
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on port: ${process.env.PORT}.`)
);

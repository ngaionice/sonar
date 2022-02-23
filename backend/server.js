import express from "express";
import dotenv from "dotenv";

import getDatabaseClient from "./clients/database-client.js";
import initializeFirebase from "./firebase.js";
import cors from "cors";

dotenv.config();
initializeFirebase();
const app = express();
const client = await getDatabaseClient();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/health", (req, res) => {
  res.status(200).json(new Date());
});

app.post("/api/login", (req, res) => {
  console.log(req.body);
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on port: ${process.env.PORT}.`)
);

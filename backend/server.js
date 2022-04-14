import express from "express";
import dotenv from "dotenv";

import getDatabaseClient from "./clients/database-client.js";
import initializeFirebase from "./firebase.js";
import cors from "cors";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import fileRoutes from "./routes/file-routes.js";

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

app.use("/api/auth", authRoutes(client));
app.use("/api/users", userRoutes(client));
app.use("/api/files", fileRoutes(client));

app.listen(process.env.PORT, () =>
  console.log(`Listening on port: ${process.env.PORT}.`)
);

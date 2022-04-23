import express from "express";
import dotenv from "dotenv";

import getDatabaseClient from "./clients/database-client.js";
import initializeFirebase from "./firebase.js";
import cors from "cors";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import fileRoutes from "./routes/file-routes.js";
import * as path from "path";
import { errorHandler, notFound } from "./middleware/error.js";

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

const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
}

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Listening on port: ${process.env.PORT}.`)
);

import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", project: "Job Application Tracker", stage: "in-development" }));
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.code === 11000) return res.status(409).json({ message: "That email is already registered." });
  if (err?.name === "ValidationError") return res.status(400).json({ message: err.message });
  res.status(500).json({ message: "Unexpected server error." });
});

const port = Number(process.env.PORT || 5000);
connectDB().then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((err) => { console.error("Failed to start API:", err.message); process.exit(1); });

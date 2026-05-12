import "dotenv/config";
import express from "express";
import cors from "cors";

import superAdminRoutes from "./routes/superAdmin.js";
import authRoutes from "./routes/auth.js";
import flagRoutes from "./routes/flag.js";

const app = express();

// ── MIDDLEWARE
app.use(
  cors({
    // Allow requests from all three frontend dev servers
    origin: [
      "http://localhost:3001", // super admin
      "http://localhost:3002", // org admin
      "http://localhost:3003", // end user
    ],
    credentials: true,
  }),
);
app.use(express.json());

// ── ROUTES
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/flags", flagRoutes);

// ── HEALTH CHECK
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── GLOBAL ERROR HANDLER
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An unexpected error occurred." });
});

// ── START
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
  console.log(`   Super admin: ${process.env.SUPER_ADMIN_EMAIL}`);
});

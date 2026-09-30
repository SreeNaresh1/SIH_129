/**
 * server/app.js
 *
 * Exportable Express application — no app.listen here.
 * Used by:
 *   - server/server.js  → local dev (calls app.listen)
 *   - api/index.js      → Vercel serverless (exports directly)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { sequelize } = require("./config/database");
const authRoutes = require("./routes/auth");
const interopRoutes = require("./routes/interop");

const app = express();

/* ── CORS ─────────────────────────────────────────────────── */
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

/* ── BODY PARSER ──────────────────────────────────────────── */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ── STATIC UPLOADS ───────────────────────────────────────── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ── DB INIT MIDDLEWARE (must be before routes) ───────────── */
let _dbReady = false;
let _dbInitPromise = null;

async function initDb() {
  if (_dbReady) return;
  if (_dbInitPromise) return _dbInitPromise;

  _dbInitPromise = (async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    // Auto-seed if DB is empty (Vercel cold start with /tmp SQLite)
    const User = require("./models/User");
    const count = await User.count();
    if (count === 0) {
      console.log("[MahaSetu] Empty DB — auto-seeding demo data...");
      const { seed } = require("./seedDemoData");
      await seed();
      console.log("[MahaSetu] Auto-seed complete.");
    }
    _dbReady = true;
  })();

  return _dbInitPromise;
}

// Start DB init eagerly (so it's ready before first request)
initDb().catch(err => console.error("[MahaSetu] DB init error:", err));

// Middleware: wait for DB before any route
app.use(async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (err) {
    console.error("DB init failed:", err);
    res.status(503).json({ success: false, message: "Database initializing, retry in a moment." });
  }
});

/* ── ROOT ─────────────────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MahaSetu — Maharashtra Unified Interoperability Framework",
    problemStatementId: "26129",
    version: "2.6.0"
  });
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, server: "UP", database: "Connected" });
  } catch (err) {
    res.status(500).json({ success: false, server: "UP", database: "Disconnected", error: err.message });
  }
});

/* ── API ROUTES ───────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/interop", interopRoutes);

app.get("/api/ai/health", async (req, res) => {
  try {
    const { checkOllamaHealth } = require("./services/aiService");
    const health = await checkOllamaHealth();
    return res.json({ success: true, provider: "Ollama", ...health });
  } catch (e) {
    return res.json({ success: false, provider: "Ollama", available: false });
  }
});

/* ── 404 ──────────────────────────────────────────────────── */
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.originalUrl}` });
});

/* ── GLOBAL ERROR ─────────────────────────────────────────── */
app.use((err, req, res, _next) => {
  console.error("SERVER ERROR:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

module.exports = app;

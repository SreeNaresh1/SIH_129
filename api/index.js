/**
 * api/index.js — Vercel Serverless Entry Point for MahaSetu Backend
 *
 * This file wraps the full Express app as a single Vercel serverless function.
 * SQLite is stored in /tmp (Vercel's only writable dir).
 * Demo data is auto-seeded on first cold start.
 */

// ── Point all file-relative requires to the server/ source dir ──────────────
const path = require("path");

// Redirect __dirname-based lookups inside server/ modules to use /tmp for SQLite
process.env.DB_DIALECT = "sqlite";
process.env.DB_STORAGE = "/tmp/mahasetu.sqlite";

// ── Load the pre-built Express app ───────────────────────────────────────────
const app = require("../server/app.js");

module.exports = app;

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
// JanSetu Federated Middleware Grid Mounted

const { sequelize } = require("./config/database");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/auth");
const interopRoutes = require("./routes/interop");
// NOTE: problems, advanced, industry routes removed — not part of PS 26129 middleware scope

/* =========================================================
   APP
========================================================= */

const app = express();

/* =========================================================
   PORT
========================================================= */

const PORT = process.env.PORT || 5000;

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(
  express.json({
    limit: "20mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb"
  })
);

/* =========================================================
   UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

/* =========================================================
   ROOT TEST
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MahaSetu - Maharashtra Unified Interoperability Framework (MUIF) Backend is running",
    problemStatementId: "26129",
    organization: "Government of Maharashtra (MSInS)",
    interoperabilityEngine: true,
    version: "2.6.0"
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/health",
  async (req, res) => {
    try {
      await sequelize.authenticate();

      res.json({
        success: true,
        server: "Backend is running",
        database: "Connected",
        port: PORT
      });
    } catch (error) {
      console.error(
        "Database health check error:",
        error
      );

      res.status(500).json({
        success: false,
        server: "Backend is running",
        database: "Disconnected",
        error: error.message
      });
    }
  }
);

/* =========================================================
   API ROUTES
========================================================= */

/*
   Authentication — /api/auth/...
*/
app.use("/api/auth", authRoutes);

/*
   Interoperability Middleware & Connectors (SIH PS 26129)
   This is the ONLY product API — /api/interop/...
   All connector, MDM, consent, DLQ, workflow, audit, event endpoints live here.
*/
app.use("/api/interop", interopRoutes);

/* =========================================================
   ADVANCED ROUTE VERIFICATION
========================================================= */

/*
   This endpoint is only for checking that the advanced
   router is actually mounted and running.

   Open:

   http://localhost:5000/api/advanced/route-check
*/


/* =========================================================
   OLLAMA / AI HEALTH CHECK (http://localhost:11434)
========================================================= */

app.get(
  "/api/ai/health",
  async (req, res) => {
    const { checkOllamaHealth } = require("./services/aiService");
    const health = await checkOllamaHealth();
    return res.json({
      success: true,
      provider: "Ollama",
      model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
      endpoint: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      ...health
    });
  }
);

/* =========================================================
   API 404 HANDLER
========================================================= */

app.use(
  "/api",
  (req, res) => {
    console.log(
      `API endpoint not found: ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      success: false,
      message:
        `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error"
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    console.log(
      "=========================================="
    );

    console.log(
      "MAHASETU — INTEROPERABILITY MIDDLEWARE ENGINE"
    );

    console.log(
      "PS 26129 | NOT a portal | API Gateway for existing state portals"
    );

    console.log(
      "=========================================="
    );

    /* =====================================================
       DATABASE
    ===================================================== */

    console.log(
      "Connecting to MySQL..."
    );

    await sequelize.authenticate();

    console.log(
      "MySQL connected successfully."
    );

    /* =====================================================
       DATABASE SYNC

       IMPORTANT:
       Do NOT use force:true.
    ===================================================== */

    await sequelize.sync({
      alter: false
    });

    console.log("Database models synchronized.");

    /* =====================================================
       SERVER
    ===================================================== */

    app.listen(PORT, "0.0.0.0", () => {
      console.log("==========================================");
      console.log(`MahaSetu Middleware running on port ${PORT}`);
      console.log(`Middleware API: http://localhost:${PORT}/api/interop`);
      console.log(`Auth API:       http://localhost:${PORT}/api/auth`);
      console.log(`Health Check:   http://localhost:${PORT}/health`);
      console.log("==========================================");
      console.log("Core Middleware Endpoints:");
      console.log(`  GET    /api/interop/connectors`);
      console.log(`  GET    /api/interop/exchange-logs`);
      console.log(`  GET    /api/interop/mdm/golden-records`);
      console.log(`  GET    /api/interop/dlq`);
      console.log(`  GET    /api/interop/metrics`);
      console.log(`  GET    /api/interop/consent/records`);
      console.log(`  GET    /api/interop/events`);
      console.log("==========================================");

      const { checkOllamaHealth } = require("./services/aiService");
      checkOllamaHealth().then(health => {
        if (health.isAvailable) {
          console.log(`[Ollama] ONLINE — Model: ${health.targetModel}`);
        } else {
          console.log(`[Ollama] OFFLINE — ${health.error}`);
        }
      });
    });
  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error(
      "BACKEND STARTUP FAILED"
    );

    console.error(
      "=========================================="
    );

    console.error(
      error
    );

    process.exit(1);
  }
}

/* =========================================================
   START
========================================================= */

startServer();
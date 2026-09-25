require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { sequelize } = require("./config/database");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problems");
const advancedRoutes = require("./routes/advanced");
const industryRoutes = require("./routes/industry");

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
    message: "SIH Portal Backend is running",
    database: "MySQL",
    databaseName:
      process.env.DB_NAME ||
      "sih_portal",
    advancedFeatures: true
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
   Authentication

   /api/auth/...
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
   Citizen / Government Problems

   /api/problems/...
*/

app.use(
  "/api/problems",
  problemRoutes
);

/*
   Advanced Government / University / AI Features

   /api/advanced/...
*/

app.use(
  "/api/advanced",
  advancedRoutes
);

/*
   Private Industry Portal

   /api/industry/...
*/

app.use(
  "/api/industry",
  industryRoutes
);

/* =========================================================
   ADVANCED ROUTE VERIFICATION
========================================================= */

/*
   This endpoint is only for checking that the advanced
   router is actually mounted and running.

   Open:

   http://localhost:5000/api/advanced/route-check
*/

app.get(
  "/api/advanced/route-check",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Advanced router is mounted correctly.",
      prototypeReviewEndpoint:
        "POST /api/advanced/government/prototype-tests/:prototypeId/review"
    });
  }
);

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
   PRINT LOADED ADVANCED ROUTES
========================================================= */

function printAdvancedRoutes() {
  try {
    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "CHECKING ADVANCED ROUTES"
    );
    console.log(
      "=========================================="
    );

    const stack =
      advancedRoutes &&
      advancedRoutes.stack
        ? advancedRoutes.stack
        : [];

    let prototypeReviewFound =
      false;

    stack.forEach((layer) => {
      if (
        layer &&
        layer.route
      ) {
        const route =
          layer.route;

        const methods =
          Object.keys(
            route.methods || {}
          )
            .map((method) =>
              method.toUpperCase()
            )
            .join(",");

        const routePath =
          route.path;

        console.log(
          `${methods.padEnd(10)} ${routePath}`
        );

        if (
          routePath ===
            "/government/prototype-tests/:prototypeId/review" &&
          route.methods &&
          route.methods.post
        ) {
          prototypeReviewFound =
            true;
        }
      }
    });

    console.log(
      "------------------------------------------"
    );

    if (
      prototypeReviewFound
    ) {
      console.log(
        "SUCCESS: Prototype Government Review route is loaded."
      );

      console.log(
        "POST /api/advanced/government/prototype-tests/:prototypeId/review"
      );
    } else {
      console.log(
        "ERROR: Prototype Government Review route was NOT loaded."
      );
    }

    console.log(
      "=========================================="
    );
    console.log("");
  } catch (error) {
    console.error(
      "Unable to inspect advanced routes:",
      error
    );
  }
}

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    console.log(
      "=========================================="
    );

    console.log(
      "SIH PORTAL BACKEND"
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

    try {
      await sequelize.query("ALTER TABLE problems ADD COLUMN aiProvider VARCHAR(60)");
    } catch (_) {}
    try {
      await sequelize.query("ALTER TABLE problems ADD COLUMN aiModel VARCHAR(100)");
    } catch (_) {}
    try {
      await sequelize.query("ALTER TABLE problems ADD COLUMN aiInputValidation TEXT");
    } catch (_) {}

    console.log(
      "Database models synchronized."
    );

    /* =====================================================
       VERIFY ROUTES BEFORE STARTING
    ===================================================== */

    printAdvancedRoutes();

    /* =====================================================
       SERVER
    ===================================================== */

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          "=========================================="
        );

        console.log(
          `SIH Backend running on port ${PORT}`
        );

        console.log(
          `http://localhost:${PORT}`
        );

        console.log(
          "=========================================="
        );

        console.log(
          "Available API routes:"
        );

        console.log(
          `POST   http://localhost:${PORT}/api/auth/login`
        );

        console.log(
          `POST   http://localhost:${PORT}/api/problems`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/problems`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/advanced/problems/:problemId/matches`
        );

        console.log(
          `POST   http://localhost:${PORT}/api/advanced/problems/:problemId/ai-analyze`
        );

        console.log(
          `POST   http://localhost:${PORT}/api/advanced/problems/:problemId/assign`
        );

        console.log(
          `POST   http://localhost:${PORT}/api/advanced/government/prototype-tests/:prototypeId/review`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/advanced/route-check`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/industry/profile`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/industry/projects`
        );

        console.log(
          `GET    http://localhost:${PORT}/api/industry/network`
        );

        console.log(
          "=========================================="
        );

        const { checkOllamaHealth } = require("./services/aiService");
        checkOllamaHealth().then(health => {
          if (health.isAvailable) {
            console.log(`[Ollama] Health Check: http://localhost:11434 is ONLINE (Model: ${health.targetModel} ready)`);
          } else {
            console.log(`[Ollama] Health Check: http://localhost:11434 is OFFLINE (${health.error})`);
          }
        });
      }
    );
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
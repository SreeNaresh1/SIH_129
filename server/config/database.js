const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

let sequelize;

// ── Vercel Postgres (POSTGRES_URL is auto-injected by Vercel Storage) ────────
if (process.env.POSTGRES_URL) {
  sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

// ── MySQL (local or dedicated server) ────────────────────────────────────────
} else if (process.env.DB_DIALECT === "mysql" || process.env.DB_HOST) {
  sequelize = new Sequelize(
    process.env.DB_NAME || "sih_portal",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    }
  );

// ── SQLite (local dev fallback) ───────────────────────────────────────────────
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || path.join(__dirname, "../database.sqlite"),
    logging: false
  });
}

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    const dialect = sequelize.getDialect();
    console.log("=================================");
    console.log(`Database connected successfully (${dialect})`);
    console.log("=================================");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };
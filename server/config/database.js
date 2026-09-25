const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const dialect = process.env.DB_DIALECT || "sqlite";

let sequelize;

if (dialect === "mysql") {
  sequelize = new Sequelize(
    process.env.DB_NAME || "sih_portal",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database.sqlite"),
    logging: false
  });
}

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log("=================================");
    console.log(`Database connected successfully (${dialect})`);
    console.log(`Database: ${dialect === "sqlite" ? "database.sqlite" : (process.env.DB_NAME || "sih_portal")}`);
    console.log("=================================");
  } catch (error) {
    console.error("=================================");
    console.error("Database connection failed");
    console.error("=================================");
    console.error(error.message);

    // If MySQL failed and we can fallback to SQLite
    if (dialect === "mysql") {
      console.log("Falling back to SQLite database...");
      sequelize = new Sequelize({
        dialect: "sqlite",
        storage: path.join(__dirname, "../database.sqlite"),
        logging: false
      });
      await sequelize.authenticate();
      console.log("SQLite fallback connected successfully.");
      return;
    }

    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDatabase
};
require("dotenv").config();
const { sequelize } = require("./config/database");

async function run() {
  console.log("MahaSetu Middleware: seedAdvanced invoked. Calling seedDemoData...");
  require("./seedDemoData");
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

/**
 * Root-level entry point for Render.com deployment.
 * Render runs `node server.js` from the repo root — this file
 * changes the working directory to /server so that dotenv and
 * all relative paths resolve correctly, then bootstraps the server.
 */
const path = require("path");

// Change cwd so dotenv picks up server/.env (if present)
process.chdir(path.join(__dirname, "server"));

require("./server/server.js");

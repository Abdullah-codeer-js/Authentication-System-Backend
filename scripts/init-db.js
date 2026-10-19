const { execSync } = require("child_process");
const path = require("path");

console.log("Starting database initialization...");

try {
  console.log("Running migration...");
  execSync(`node "${path.join(__dirname, "migrate.js")}"`, { stdio: "inherit" });

  console.log("Database initialization complete!");
} catch (error) {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
}

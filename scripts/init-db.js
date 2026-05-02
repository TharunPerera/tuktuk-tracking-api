const { execSync } = require("child_process");
const fs = require("fs");

console.log("\n");
console.log("=".repeat(60));
console.log("🚀 INIT-DB.JS IS EXECUTING NOW!");
console.log("=".repeat(60));
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.RAILWAY_ENVIRONMENT || "local"}`);
console.log("=".repeat(60));
console.log("\n");

const markerFile = "/tmp/db_initialized";

// Build database URL from Railway environment variables
function buildDatabaseUrl() {
  // Check for existing URL formats first
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.MYSQL_URL) return process.env.MYSQL_URL;

  // Build from Railway's MySQL variables
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (host && user && password && database) {
    return `mysql://${user}:${password}@${host}:${port}/${database}`;
  }

  return null;
}

async function main() {
  console.log("Step 1: Checking if database already initialized...");

  if (fs.existsSync(markerFile)) {
    console.log(
      "✅ Marker file exists - database already initialized, skipping setup.",
    );
    return;
  }

  console.log("Step 2: No marker file found - checking database connection...");

  // Log available Railway DB variables
  console.log("Railway DB Variables:");
  console.log(`  DB_HOST: ${process.env.DB_HOST || "not set"}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT || "not set"}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME || "not set"}`);
  console.log(`  DB_USER: ${process.env.DB_USER || "not set"}`);
  console.log(
    `  DB_PASSWORD: ${process.env.DB_PASSWORD ? "***SET***" : "not set"}`,
  );

  // Build database URL
  const dbUrl = buildDatabaseUrl();
  console.log(`\nDatabase URL built: ${dbUrl ? "Yes" : "No"}`);

  if (!dbUrl) {
    console.error(
      "❌ Could not build database URL from environment variables!",
    );
    console.log("Make sure your MySQL service is linked to this service.");
    return;
  }

  // Set the URL so child processes can use it
  process.env.DATABASE_URL = dbUrl;
  process.env.MYSQL_URL = dbUrl;

  // Test database connection
  console.log("\nStep 3: Testing database connection...");
  try {
    const { Sequelize } = require("sequelize");
    const sequelize = new Sequelize(dbUrl, {
      logging: false,
      dialect: "mysql",
    });
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("Will retry on next deployment...");
    return;
  }

  // Check if tables exist
  console.log("\nStep 4: Checking if tables already exist...");
  let tablesExist = false;
  try {
    const { Sequelize } = require("sequelize");
    const sequelize = new Sequelize(dbUrl, {
      logging: false,
      dialect: "mysql",
    });
    const [results] = await sequelize.query("SHOW TABLES");
    console.log(`Found ${results.length} tables in database`);
    tablesExist = results.length > 0;
    await sequelize.close();
  } catch (error) {
    console.log("Could not check tables:", error.message);
  }

  if (tablesExist) {
    console.log(
      "✅ Tables already exist - creating marker file and skipping setup.",
    );
    fs.writeFileSync(markerFile, Date.now().toString());
    return;
  }

  // Run database sync
  console.log("\nStep 5: Creating database tables...");
  try {
    execSync("npm run db:sync", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("✅ Database sync completed!");
  } catch (error) {
    console.error("❌ Database sync failed:", error.message);
    console.log("Continuing anyway...");
  }

  // Run seed
  console.log("\nStep 6: Seeding database...");
  try {
    execSync("npm run seed", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("✅ Database seed completed!");
  } catch (error) {
    console.error("❌ Database seed failed:", error.message);
  }

  // Create marker file
  fs.writeFileSync(markerFile, Date.now().toString());
  console.log("\n✅ Database initialization complete!");
  console.log("\n");
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error in init-db.js:", error);
});

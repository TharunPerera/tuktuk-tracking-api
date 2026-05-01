require("dotenv").config();
const { sequelize } = require("../src/config/database");
require("../src/models"); // Import all models (registers them with Sequelize)
const logger = require("../src/utils/logger");

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");

    // force: false = don't drop existing tables
    // alter: true = add new columns if models changed (safe for development)
    // In production, use migrations instead of sync
    await sequelize.sync({ force: false, alter: true });

    logger.info("✅ All tables synchronized successfully");
    logger.info("Tables created:");
    logger.info("  - provinces");
    logger.info("  - districts");
    logger.info("  - police_stations");
    logger.info("  - users");
    logger.info("  - drivers");
    logger.info("  - vehicles");
    logger.info("  - location_pings");
    logger.info("  - refresh_tokens");

    process.exit(0);
  } catch (error) {
    logger.error("Database sync failed:", error);
    process.exit(1);
  }
};

syncDatabase();

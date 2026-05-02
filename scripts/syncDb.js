require("dotenv").config();
const { sequelize } = require("../src/config/database");
require("../src/models");
const logger = require("../src/utils/logger");

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established");

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

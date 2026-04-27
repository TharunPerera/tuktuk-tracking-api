const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");

// Sequelize reads DB credentials from environment variables
// This means the same code works locally and in Railway
// We never hardcode passwords in code
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",

    // Connection Pool: Instead of opening a new DB connection for every request,
    // we maintain a pool of reusable connections.
    // max: 10 means up to 10 simultaneous DB operations
    // This is critical for our use case because GPS pings arrive in bursts
    pool: {
      max: 10,
      min: 2,
      acquire: 30000, // max ms to wait for a connection before throwing error
      idle: 10000, // ms before an idle connection is released
    },

    logging: (msg) => logger.debug(msg), // Route SQL logs through Winston

    define: {
      // All tables will have created_at and updated_at automatically
      timestamps: true,
      underscored: true, // Use snake_case for column names (created_at not createdAt)
    },

    timezone: "+05:30", // Sri Lanka Standard Time (UTC+5:30)
  },
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ MySQL database connected successfully");
  } catch (error) {
    logger.error("❌ Database connection failed:", error.message);
    process.exit(1); // Kill the app if DB fails — no point running without DB
  }
};

module.exports = { sequelize, connectDB };

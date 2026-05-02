// module.exports = logger;
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs/ directory exists at project root
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Human-readable format for development terminal output
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  }),
);

// JSON format for production (Railway, Datadog, etc.)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level:
    process.env.NODE_ENV === "test"
      ? "error"
      : process.env.NODE_ENV === "production"
        ? "info"
        : "debug",

  format:
    process.env.NODE_ENV === "production"
      ? productionFormat
      : developmentFormat,

  transports: [
    // Console output — visible in VS Code terminal
    new winston.transports.Console({
      // Silent in test mode so npm test output stays clean
      silent: process.env.NODE_ENV === "test",
    }),

    // Error log — only error level entries
    // logs/error.log grows until maxsize, then rotates to error1.log etc.
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 3, // keep error.log, error1.log, error2.log
      tailable: true, // error.log always has newest entries
    }),

    // Combined log — all levels (debug, info, warn, error)
    // logs/combined.log grows until maxsize, then rotates
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 3, // keep combined.log, combined1.log, combined2.log
      tailable: true,
    }),
  ],
});

module.exports = logger;

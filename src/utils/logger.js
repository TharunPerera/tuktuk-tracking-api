// // const winston = require("winston");

// // // Define log format
// // // In production we use JSON (machine-readable, good for log aggregation tools)
// // // In development we use colorized text (human-readable)
// // const developmentFormat = winston.format.combine(
// //   winston.format.colorize(),
// //   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
// //   winston.format.printf(({ timestamp, level, message, ...meta }) => {
// //     return `${timestamp} [${level}]: ${message} ${
// //       Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
// //     }`;
// //   }),
// // );

// // const productionFormat = winston.format.combine(
// //   winston.format.timestamp(),
// //   winston.format.errors({ stack: true }), // Include stack traces
// //   winston.format.json(),
// // );

// // const logger = winston.createLogger({
// //   level: process.env.NODE_ENV === "production" ? "info" : "debug",
// //   format:
// //     process.env.NODE_ENV === "production"
// //       ? productionFormat
// //       : developmentFormat,

// //   transports: [
// //     // Always log to console (Railway captures this)
// //     new winston.transports.Console(),

// //     // In production, also write errors to a file
// //     // This gives you a persistent error record on the server
// //     ...(process.env.NODE_ENV === "production"
// //       ? [
// //           new winston.transports.File({
// //             filename: "logs/error.log",
// //             level: "error",
// //           }),
// //           new winston.transports.File({
// //             filename: "logs/combined.log",
// //           }),
// //         ]
// //       : []),
// //   ],
// // });

// // module.exports = logger;

// const winston = require("winston");
// const path = require("path");
// const fs = require("fs");

// // Ensure logs directory exists
// const logsDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir, { recursive: true });
// }

// // Development: colorized, human-readable console output
// const developmentFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   winston.format.printf(({ timestamp, level, message, ...meta }) => {
//     const metaStr = Object.keys(meta).length
//       ? JSON.stringify(meta, null, 2)
//       : "";
//     return `${timestamp} [${level}]: ${message} ${metaStr}`;
//   }),
// );

// // Production: JSON format for log aggregation tools (Railway, Datadog, etc.)
// const productionFormat = winston.format.combine(
//   winston.format.timestamp(),
//   winston.format.errors({ stack: true }),
//   winston.format.json(),
// );

// const logger = winston.createLogger({
//   // In test mode, use 'error' to suppress noise during npm test
//   // In dev/prod, use appropriate levels
//   level:
//     process.env.NODE_ENV === "test"
//       ? "error"
//       : process.env.NODE_ENV === "production"
//         ? "info"
//         : "debug",

//   format:
//     process.env.NODE_ENV === "production"
//       ? productionFormat
//       : developmentFormat,

//   transports: [
//     // Console: always on (Railway and Docker capture this)
//     new winston.transports.Console({
//       // In test mode, silence everything except real errors
//       silent: process.env.NODE_ENV === "test",
//     }),

//     // Error log: captures only errors, always written
//     new winston.transports.File({
//       filename: path.join(logsDir, "error.log"),
//       level: "error",
//       maxsize: 5 * 1024 * 1024, // 5MB max per file
//       maxFiles: 5,
//     }),

//     // Combined log: all log levels
//     new winston.transports.File({
//       filename: path.join(logsDir, "combined.log"),
//       maxsize: 10 * 1024 * 1024, // 10MB max per file
//       maxFiles: 5,
//     }),
//   ],
// });

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

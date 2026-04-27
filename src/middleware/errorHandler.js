const { Sentry } = require("../config/sentry");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

// Custom error class so we can throw errors with HTTP status codes
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Flag: this is a known, expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
// Express identifies this as an error handler because it has 4 parameters (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // Always log the error
  logger.error(`${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Send to Sentry only in production (avoid noise in development)
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  // Sequelize validation errors (e.g., unique constraint violated)
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return sendError(res, 409, `${field} already exists`);
  }

  // Sequelize validation errors (e.g., null constraint)
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return sendError(res, 422, "Validation failed", messages);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  // Our custom AppError — operational errors with known status codes
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  // Unknown/unexpected errors — don't expose details in production
  return sendError(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Our team has been notified."
      : err.message,
  );
};

// Catch unhandled promise rejections (async errors without try/catch)
// express-async-errors package makes this work automatically
const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

module.exports = { errorHandler, notFoundHandler, AppError };

const Sentry = require("@sentry/node");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Sentry v10: use captureException directly
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return sendError(res, 409, `${field} already exists`);
  }

  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return sendError(res, 422, "Validation failed", messages);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  return sendError(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Our team has been notified."
      : err.message,
  );
};

const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

module.exports = { errorHandler, notFoundHandler, AppError };

const Sentry = require("@sentry/node");
const logger = require("../utils/logger");

const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    logger.warn("⚠️ Sentry DSN not configured — error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.NODE_ENV || "development",
  });

  logger.info("✅ Sentry error tracking initialized");
};

module.exports = { initSentry, Sentry };

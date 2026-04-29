// const Sentry = require("@sentry/node");
// const logger = require("../utils/logger");

// const initSentry = (app) => {
//   // Only initialize Sentry if DSN is configured
//   // This prevents errors in local development where you might not have Sentry set up
//   if (!process.env.SENTRY_DSN) {
//     logger.warn("⚠️  Sentry DSN not configured — error tracking disabled");
//     return;
//   }

//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,

//     // integrations: automatically captures Express request details with each error
//     integrations: [
//       new Sentry.Integrations.Http({ tracing: true }),
//       new Sentry.Integrations.Express({ app }),
//     ],

//     // tracesSampleRate: 0.1 means capture 10% of transactions for performance monitoring
//     // Don't use 1.0 in production — too much data, too slow
//     tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

//     environment: process.env.NODE_ENV || "development",
//   });

//   logger.info("✅ Sentry error tracking initialized");
// };

// module.exports = { initSentry, Sentry };

const Sentry = require("@sentry/node");
const logger = require("../utils/logger");

const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    logger.warn("⚠️  Sentry DSN not configured — error tracking disabled");
    return;
  }

  // Sentry v8+ uses a simplified init — no more Integrations.Http or Integrations.Express
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.NODE_ENV || "development",
    // In v8+, Express integration is automatic when you require @sentry/node
    // before requiring express
  });

  logger.info("✅ Sentry error tracking initialized");
};

// captureException is still available directly on Sentry object
module.exports = { initSentry, Sentry };

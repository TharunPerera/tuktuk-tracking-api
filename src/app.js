// // "use strict";
// // require("express-async-errors"); // Must be first — catches async errors without try/catch
// // require("dotenv").config();

// // const express = require("express");
// // const cors = require("cors");
// // const helmet = require("helmet");
// // const morgan = require("morgan");

// // const { initSentry, Sentry } = require("./config/sentry");
// // const { setupSwagger } = require("./config/swagger");
// // const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
// // const logger = require("./utils/logger");

// // // Import routes
// // const authRoutes = require("./routes/auth.routes");
// // const vehicleRoutes = require("./routes/vehicle.routes");
// // const locationRoutes = require("./routes/location.routes");
// // const provinceRoutes = require("./routes/province.routes");
// // const districtRoutes = require("./routes/district.routes");

// // const app = express();

// // // ==========================================
// // // SENTRY — Initialize FIRST before any other middleware
// // // ==========================================
// // initSentry(app);
// // app.use(Sentry.Handlers.requestHandler()); // Captures request context for each error

// // // ==========================================
// // // SECURITY MIDDLEWARE (API Gateway layer)
// // // ==========================================

// // // Helmet: Sets security HTTP headers (prevents clickjacking, XSS, etc.)
// // app.use(helmet());

// // // CORS: Only allow requests from known origins
// // app.use(
// //   cors({
// //     origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
// //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// //     allowedHeaders: ["Content-Type", "Authorization"],
// //   }),
// // );

// // // ==========================================
// // // REQUEST PARSING
// // // ==========================================
// // app.use(express.json({ limit: "10kb" })); // Reject bodies > 10kb (prevents payload attacks)
// // app.use(express.urlencoded({ extended: true }));

// // // ==========================================
// // // LOGGING MIDDLEWARE
// // // ==========================================
// // // Morgan: logs every HTTP request
// // // 'combined' format: IP, method, URL, status, response time
// // const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
// // app.use(
// //   morgan(morganFormat, {
// //     stream: {
// //       write: (message) => logger.http(message.trim()),
// //     },
// //   }),
// // );

// // // ==========================================
// // // API DOCUMENTATION
// // // ==========================================
// // setupSwagger(app);

// // // ==========================================
// // // HEALTH CHECK (no auth needed — for Railway health checks)
// // // ==========================================
// // app.get("/health", (req, res) => {
// //   res.json({
// //     status: "ok",
// //     timestamp: new Date().toISOString(),
// //     environment: process.env.NODE_ENV,
// //     version: process.env.npm_package_version || "1.0.0",
// //   });
// // });

// // // ==========================================
// // // API ROUTES
// // // ==========================================
// // const API_PREFIX = `/api/${process.env.API_VERSION || "v1"}`;

// // app.use(`${API_PREFIX}/auth`, authRoutes);
// // app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
// // app.use(`${API_PREFIX}/locations`, locationRoutes);
// // app.use(`${API_PREFIX}/provinces`, provinceRoutes);
// // app.use(`${API_PREFIX}/districts`, districtRoutes);

// // // ==========================================
// // // ERROR HANDLERS (must be after routes)
// // // ==========================================
// // app.use(Sentry.Handlers.errorHandler()); // Sentry captures errors here
// // app.use(notFoundHandler); // 404 for unknown routes
// // app.use(errorHandler); // Global error handler

// // module.exports = app;

// "use strict";
// require("express-async-errors");
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

// const { initSentry, Sentry } = require("./config/sentry");
// const { setupSwagger } = require("./config/swagger");
// const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
// const logger = require("./utils/logger");

// const authRoutes = require("./routes/auth.routes");
// const vehicleRoutes = require("./routes/vehicle.routes");
// const locationRoutes = require("./routes/location.routes");
// const provinceRoutes = require("./routes/province.routes");
// const districtRoutes = require("./routes/district.routes");
// const stationRoutes = require("./routes/station.routes"); // ADD THIS

// const app = express();

// // ==========================================
// // SENTRY — Initialize before everything
// // v10 no longer uses middleware handlers
// // ==========================================
// initSentry();

// // ==========================================
// // SECURITY MIDDLEWARE (API Gateway layer)
// // ==========================================
// app.use(helmet());

// app.use(
//   cors({
//     origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// // ==========================================
// // REQUEST PARSING
// // ==========================================
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true }));

// // ==========================================
// // LOGGING MIDDLEWARE
// // ==========================================
// const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
// app.use(
//   morgan(morganFormat, {
//     stream: {
//       // Use logger.info instead of logger.http to avoid level issues
//       write: (message) => logger.info(message.trim()),
//     },
//   }),
// );

// // ==========================================
// // API DOCUMENTATION
// // ==========================================
// setupSwagger(app);

// // ==========================================
// // HEALTH CHECK
// // ==========================================
// app.get("/health", (req, res) => {
//   res.json({
//     status: "ok",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV,
//     version: "1.0.0",
//   });
// });

// // ==========================================
// // API ROUTES
// // ==========================================
// const API_PREFIX = `/api/${process.env.API_VERSION || "v1"}`;

// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
// app.use(`${API_PREFIX}/locations`, locationRoutes);
// app.use(`${API_PREFIX}/provinces`, provinceRoutes);
// app.use(`${API_PREFIX}/districts`, districtRoutes);
// app.use(`${API_PREFIX}/stations`, stationRoutes); // ADD THIS

// // ==========================================
// // ERROR HANDLERS — must be LAST
// // ==========================================

// // Sentry v10: capture errors manually in errorHandler, no middleware needed
// app.use(notFoundHandler);
// app.use(errorHandler);

// module.exports = app;

"use strict";
require("express-async-errors");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { initSentry, Sentry } = require("./config/sentry");
const { setupSwagger } = require("./config/swagger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// Routes
const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const locationRoutes = require("./routes/location.routes");
const provinceRoutes = require("./routes/province.routes");
const districtRoutes = require("./routes/district.routes");
const stationRoutes = require("./routes/station.routes");
const driverRoutes = require("./routes/driver.routes");
const userRoutes = require("./routes/user.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

// ==========================================
// SENTRY — Initialize before everything
// v10 no longer uses middleware handlers
// ==========================================
initSentry();

// ==========================================
// SECURITY MIDDLEWARE (API Gateway layer)
// ==========================================
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "If-None-Match"],
    // Expose ETag so clients can cache responses
    exposedHeaders: ["ETag", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  }),
);

// ==========================================
// REQUEST PARSING
// ==========================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// LOGGING MIDDLEWARE
// ==========================================
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// ==========================================
// API DOCUMENTATION
// ==========================================
setupSwagger(app);

// ==========================================
// HEALTH CHECK (shallow + deep)
// ==========================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// Deep health check — tests DB connection
app.get("/health/db", async (req, res, next) => {
  try {
    const { sequelize } = require("./config/database");
    await sequelize.authenticate();
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as vehicle_count FROM vehicles",
    );
    res.json({
      status: "ok",
      database: "connected",
      vehicle_count: results[0].vehicle_count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

// ==========================================
// API ROUTES
// ==========================================
const API_PREFIX = `/api/${process.env.API_VERSION || "v1"}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/provinces`, provinceRoutes);
app.use(`${API_PREFIX}/districts`, districtRoutes);
app.use(`${API_PREFIX}/stations`, stationRoutes);
app.use(`${API_PREFIX}/drivers`, driverRoutes); // NEW: Full driver CRUD
app.use(`${API_PREFIX}/users`, userRoutes); // NEW: User management
app.use(`${API_PREFIX}/stats`, statsRoutes); // NEW: Analytics/monitoring

// ==========================================
// ERROR HANDLERS — must be LAST
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

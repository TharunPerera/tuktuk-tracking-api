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

// Sentry test controller
const sentryTestController = require("./controllers/sentry-test.controller");

const app = express();

// ==========================================
// SENTRY — Initialize before everything
// ==========================================
initSentry();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "If-None-Match"],
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
// HEALTH CHECKS
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
// SENTRY TEST ROUTE (ADDED HERE - BEFORE ERROR HANDLERS)
// ==========================================
app.get("/sentry-test", sentryTestController.testSentry);

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
app.use(`${API_PREFIX}/drivers`, driverRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);

// ==========================================
// ERROR HANDLERS — MUST BE LAST
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

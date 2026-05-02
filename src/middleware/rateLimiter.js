const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Disable limiter during tests (VERY IMPORTANT)
const isTest = process.env.NODE_ENV === "test";

// General limiter
const generalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          success: false,
          message: "Too many requests. Try again later.",
        });
      },
    });

// Device limiter
const deviceLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: parseInt(process.env.DEVICE_RATE_LIMIT_MAX) || 200,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Device rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          success: false,
          message: "Device rate limit exceeded",
        });
      },
    });

// Auth limiter (your improved version ✅)
const authLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const resetTime = new Date(req.rateLimit.resetTime);
        const secondsLeft = Math.ceil((resetTime - Date.now()) / 1000);

        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);

        res.status(429).json({
          success: false,
          message: `Too many login attempts. Try again in ${secondsLeft} seconds.`,
          retry_after_seconds: secondsLeft,
          retry_at: resetTime.toISOString(),
        });
      },
      keyGenerator: (req) => req.ip,
    });

module.exports = { generalLimiter, deviceLimiter, authLimiter };

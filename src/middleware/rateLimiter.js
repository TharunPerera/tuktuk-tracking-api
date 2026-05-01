// // // const rateLimit = require("express-rate-limit");
// // // const { sendError } = require("../utils/response");
// // // const logger = require("../utils/logger");

// // // // Standard rate limiter for general API users (police officers)
// // // // 100 requests per 15 minutes per IP
// // // const generalLimiter = rateLimit({
// // //   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
// // //   max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
// // //   standardHeaders: true, // Send RateLimit headers in response (REST best practice)
// // //   legacyHeaders: false,

// // //   // Custom response when limit exceeded
// // //   handler: (req, res) => {
// // //     logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
// // //     sendError(
// // //       res,
// // //       429,
// // //       "Too many requests. Please try again after 15 minutes.",
// // //     );
// // //   },

// // //   // Key by IP address
// // //   keyGenerator: (req) => req.ip,
// // // });

// // // // Higher limit for GPS device clients
// // // // Devices ping every 30 seconds = 2/min × 200 devices = 400/min
// // // // Per device: 120 pings per 15 min (2/min × 15min × safety margin)
// // // const deviceLimiter = rateLimit({
// // //   windowMs: 15 * 60 * 1000,
// // //   max: parseInt(process.env.DEVICE_RATE_LIMIT_MAX) || 200,
// // //   standardHeaders: true,
// // //   legacyHeaders: false,
// // //   handler: (req, res) => {
// // //     logger.warn(`Device rate limit exceeded for IP: ${req.ip}`);
// // //     sendError(res, 429, "Device ping rate limit exceeded");
// // //   },
// // // });

// // // // Strict limiter for auth endpoints — prevent brute force attacks
// // // // 10 login attempts per 15 minutes per IP
// // // const authLimiter = rateLimit({
// // //   windowMs: 15 * 60 * 1000,
// // //   max: 10,
// // //   standardHeaders: true,
// // //   legacyHeaders: false,
// // //   handler: (req, res) => {
// // //     logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
// // //     sendError(res, 429, "Too many login attempts. Try again in 15 minutes.");
// // //   },
// // // });

// // // module.exports = { generalLimiter, deviceLimiter, authLimiter };

// // const rateLimit = require("express-rate-limit");
// // const { sendError } = require("../utils/response");
// // const logger = require("../utils/logger");

// // // Standard rate limiter for general API users (police officers)
// // // 100 requests per 15 minutes per IP
// // const generalLimiter = rateLimit({
// //   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
// //   max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
// //   standardHeaders: true, // Send RateLimit headers in response (REST best practice)
// //   legacyHeaders: false,

// //   // Custom response when limit exceeded
// //   handler: (req, res) => {
// //     logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
// //     sendError(
// //       res,
// //       429,
// //       "Too many requests. Please try again after 15 minutes.",
// //     );
// //   },
// //   // ✅ REMOVED keyGenerator - library handles it automatically
// // });

// // // Higher limit for GPS device clients
// // // Devices ping every 30 seconds = 2/min × 200 devices = 400/min
// // // Per device: 120 pings per 15 min (2/min × 15min × safety margin)
// // const deviceLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: parseInt(process.env.DEVICE_RATE_LIMIT_MAX) || 200,
// //   standardHeaders: true,
// //   legacyHeaders: false,
// //   handler: (req, res) => {
// //     logger.warn(`Device rate limit exceeded for IP: ${req.ip}`);
// //     sendError(res, 429, "Device ping rate limit exceeded");
// //   },
// //   // ✅ REMOVED keyGenerator
// // });

// // // Strict limiter for auth endpoints — prevent brute force attacks
// // // 10 login attempts per 15 minutes per IP
// // const authLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 10,
// //   standardHeaders: true,
// //   legacyHeaders: false,
// //   handler: (req, res) => {
// //     logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
// //     sendError(res, 429, "Too many login attempts. Try again in 15 minutes.");
// //   },
// //   // ✅ REMOVED keyGenerator
// // });

// // module.exports = { generalLimiter, deviceLimiter, authLimiter };

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     // Get the rate limit info from the request
//     const resetTime = new Date(req.rateLimit.resetTime);
//     const minutesLeft = Math.ceil((resetTime - Date.now()) / 60000);
//     const secondsLeft = Math.ceil((resetTime - Date.now()) / 1000);

//     logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);

//     res.status(429).json({
//       success: false,
//       message: `Too many login attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""} (${secondsLeft} seconds).`,
//       retry_after_seconds: secondsLeft,
//       retry_at: resetTime.toISOString(),
//     });
//   },
//   keyGenerator: (req) => req.ip, // ✅ ADD THIS BACK
// });

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

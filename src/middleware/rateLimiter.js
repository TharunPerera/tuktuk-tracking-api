const rateLimit = require("express-rate-limit");
const { sendError } = require("../utils/response");
const logger = require("../utils/logger");

// Standard rate limiter for general API users (police officers)
// 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true, // Send RateLimit headers in response (REST best practice)
  legacyHeaders: false,

  // Custom response when limit exceeded
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    sendError(
      res,
      429,
      "Too many requests. Please try again after 15 minutes.",
    );
  },

  // Key by IP address
  keyGenerator: (req) => req.ip,
});

// Higher limit for GPS device clients
// Devices ping every 30 seconds = 2/min × 200 devices = 400/min
// Per device: 120 pings per 15 min (2/min × 15min × safety margin)
const deviceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.DEVICE_RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Device rate limit exceeded for IP: ${req.ip}`);
    sendError(res, 429, "Device ping rate limit exceeded");
  },
});

// Strict limiter for auth endpoints — prevent brute force attacks
// 10 login attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    sendError(res, 429, "Too many login attempts. Try again in 15 minutes.");
  },
});

module.exports = { generalLimiter, deviceLimiter, authLimiter };

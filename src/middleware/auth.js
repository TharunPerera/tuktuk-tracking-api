const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const logger = require("../utils/logger");

// Verify JWT token from Authorization header
// Expected header: Authorization: Bearer <token>
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError("Authentication required. No token provided.", 401),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify signature and expiry using our secret
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request — available in all subsequent middleware/controllers
    req.user = decoded;

    logger.debug(`Authenticated user: ${decoded.username} (${decoded.role})`);
    next();
  } catch (error) {
    next(error); // Passes to errorHandler which handles JWT errors
  }
};

// Role-based authorization
// Usage: authorize('SUPER_ADMIN', 'PROVINCIAL_ADMIN')
// This returns a middleware function that checks if the authenticated user has one of the allowed roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by ${req.user.username} (${req.user.role}) to ${req.path}`,
      );
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
          403,
        ),
      );
    }

    next();
  };
};

// Geographic scope enforcement
// A PROVINCIAL_ADMIN can only see data for their own province
// This middleware adds scope filters that controllers must respect
const enforceScope = (req, res, next) => {
  const { role, province_id, district_id, station_id } = req.user;

  // SUPER_ADMIN has no restrictions — can see everything
  if (role === "SUPER_ADMIN") {
    req.scope = {}; // Empty scope = no filter
    return next();
  }

  // PROVINCIAL_ADMIN is restricted to their province
  if (role === "PROVINCIAL_ADMIN") {
    req.scope = { province_id };
    return next();
  }

  // STATION_OFFICER is restricted to their district
  if (role === "STATION_OFFICER") {
    req.scope = { district_id, station_id };
    return next();
  }

  // DEVICE_CLIENT has its own scope — handled separately in location routes
  req.scope = {};
  next();
};

module.exports = { authenticate, authorize, enforceScope };

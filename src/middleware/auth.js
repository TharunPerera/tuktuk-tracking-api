const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const logger = require("../utils/logger");
const { Vehicle } = require("../models");

// Verify JWT token from Authorization header
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError("Authentication required. No token provided.", 401),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    logger.debug(`Authenticated user: ${decoded.username} (${decoded.role})`);
    next();
  } catch (error) {
    next(error);
  }
};

// SPECIAL: Authenticate GPS device by IMEI (no JWT required)
// This is the secure device authentication method for Issue #1
const authenticateDevice = async (req, res, next) => {
  const deviceImei = req.body.device_imei || req.headers["x-device-imei"];

  if (!deviceImei) {
    return next(new AppError("Device IMEI required for authentication", 401));
  }

  try {
    // Find vehicle by IMEI - this is the device's "identity"
    const vehicle = await Vehicle.findOne({
      where: { device_imei: deviceImei, status: "ACTIVE" },
    });

    if (!vehicle) {
      logger.warn(
        `Device authentication failed: IMEI ${deviceImei} not registered`,
      );
      return next(new AppError("Invalid device credentials", 401));
    }

    // Attach vehicle info to request
    req.device = {
      vehicle_id: vehicle.id,
      registration_number: vehicle.registration_number,
      device_imei: deviceImei,
      province_id: vehicle.province_id,
      district_id: vehicle.district_id,
    };

    logger.debug(
      `Device authenticated: ${vehicle.registration_number} (IMEI: ${deviceImei})`,
    );
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based authorization
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
const enforceScope = (req, res, next) => {
  const { role, province_id, district_id, station_id } = req.user;

  if (role === "SUPER_ADMIN") {
    req.scope = {};
    return next();
  }

  if (role === "PROVINCIAL_ADMIN") {
    req.scope = { province_id };
    return next();
  }

  if (role === "STATION_OFFICER") {
    req.scope = { district_id, station_id };
    return next();
  }

  req.scope = {};
  next();
};

module.exports = { authenticate, authenticateDevice, authorize, enforceScope };

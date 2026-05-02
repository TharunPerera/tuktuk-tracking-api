const { Op } = require("sequelize");
const { LocationPing, Vehicle, Province, District } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// POST a new GPS ping from a device
const postPing = async ({
  device_imei,
  latitude,
  longitude,
  speed,
  heading,
  accuracy,
  timestamp,
}) => {
  // Find vehicle by IMEI — this is how the device identifies itself
  const vehicle = await Vehicle.findOne({
    where: { device_imei },
    include: [
      { model: Province, as: "province", attributes: ["id"] },
      { model: District, as: "district", attributes: ["id"] },
    ],
  });

  if (!vehicle) {
    throw new AppError(`Device IMEI ${device_imei} not registered`, 404);
  }

  if (vehicle.status === "SUSPENDED") {
    throw new AppError("Vehicle is suspended from tracking system", 403);
  }

  if (vehicle.status === "INACTIVE") {
    throw new AppError("Vehicle is inactive", 403);
  }

  // IMPORTANT: The device sends its own timestamp (which may be in the past
  // due to network delays). We store the device timestamp but ALWAYS use
  // the server's current time if no timestamp was provided.
  // The device timestamp is for the GPS fix time; created_at is server receive time.
  const pingTimestamp = timestamp ? new Date(timestamp) : new Date();

  const ping = await LocationPing.create({
    vehicle_id: vehicle.id,
    latitude,
    longitude,
    speed: speed || 0,
    heading: heading || 0,
    accuracy,
    timestamp: pingTimestamp,
    province_id: vehicle.province_id,
    district_id: vehicle.district_id,
  });

  logger.debug(
    `Ping received: Vehicle ${vehicle.registration_number} at ${latitude}, ${longitude} | GPS time: ${pingTimestamp.toISOString()}`,
  );

  return ping;
};

// GET last known location of a vehicle
const getLatestLocation = async (vehicleId) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const latest = await LocationPing.findOne({
    where: { vehicle_id: vehicleId },
    order: [["timestamp", "DESC"]],
    limit: 1,
    include: [
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["registration_number", "status"],
      },
    ],
  });

  if (!latest) {
    throw new AppError("No location data available for this vehicle", 404);
  }

  return latest;
};

// GET movement history for a vehicle in a time window
const getHistory = async (vehicleId, from, to, page = 1, limit = 100) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const offset = (page - 1) * limit;

  const { count, rows } = await LocationPing.findAndCountAll({
    where: {
      vehicle_id: vehicleId,
      timestamp: {
        [Op.between]: [new Date(from), new Date(to)],
      },
    },
    order: [["timestamp", "ASC"]], // Chronological for route reconstruction
    limit: parseInt(limit),
    offset,
  });

  return { count, rows, page, limit };
};

// GET all vehicles' latest location (province/district filtered)
// Uses raw SQL subquery for performance — Sequelize ORM version is slow at 400k+ rows
const getLiveView = async (scope = {}, filters = {}) => {
  const { sequelize } = require("../config/database");

  const whereVehicle = { status: "ACTIVE" };
  if (scope.province_id) whereVehicle.province_id = scope.province_id;
  if (scope.district_id) whereVehicle.district_id = scope.district_id;
  if (filters.province_id && !scope.province_id)
    whereVehicle.province_id = filters.province_id;
  if (filters.district_id && !scope.district_id)
    whereVehicle.district_id = filters.district_id;

  const vehicles = await Vehicle.findAll({
    where: whereVehicle,
    attributes: [
      "id",
      "registration_number",
      "status",
      "province_id",
      "district_id",
    ],
  });

  if (!vehicles.length) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  // Subquery: for each vehicle, get the ping with the MAX timestamp
  const latestPings = await sequelize.query(
    `
    SELECT lp.*
    FROM location_pings lp
    INNER JOIN (
      SELECT vehicle_id, MAX(timestamp) as max_ts
      FROM location_pings
      WHERE vehicle_id IN (:vehicleIds)
      GROUP BY vehicle_id
    ) latest ON lp.vehicle_id = latest.vehicle_id
           AND lp.timestamp = latest.max_ts
    `,
    {
      replacements: { vehicleIds },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  return latestPings;
};

module.exports = { postPing, getLatestLocation, getHistory, getLiveView };

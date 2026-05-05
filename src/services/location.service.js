const { Op, Sequelize } = require("sequelize");
const { LocationPing, Vehicle, Province, District } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Haversine formula to calculate distance between two points on Earth
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const postPing = async ({
  vehicle_id,
  latitude,
  longitude,
  speed,
  heading,
  accuracy,
  timestamp,
}) => {
  const vehicle = await Vehicle.findByPk(vehicle_id);
  if (!vehicle) throw new AppError("Vehicle not found", 404);
  if (vehicle.status === "SUSPENDED")
    throw new AppError("Vehicle is suspended", 403);
  if (vehicle.status === "INACTIVE")
    throw new AppError("Vehicle is inactive", 403);

  const pingTimestamp = timestamp ? new Date(timestamp) : new Date();

  const ping = await LocationPing.create({
    vehicle_id,
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
    `Ping received: Vehicle ${vehicle.registration_number} at ${latitude}, ${longitude}`,
  );
  return ping;
};

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

  if (!latest)
    throw new AppError("No location data available for this vehicle", 404);
  return latest;
};

const getHistory = async (vehicleId, from, to, page = 1, limit = 100) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  const offset = (page - 1) * limit;

  const { count, rows } = await LocationPing.findAndCountAll({
    where: {
      vehicle_id: vehicleId,
      timestamp: { [Op.between]: [new Date(from), new Date(to)] },
    },
    order: [["timestamp", "ASC"]],
    limit: parseInt(limit),
    offset,
  });

  return { count, rows, page, limit };
};

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

  const latestPings = await sequelize.query(
    `SELECT lp.*, v.registration_number, v.status as vehicle_status
     FROM location_pings lp
     INNER JOIN (
       SELECT vehicle_id, MAX(timestamp) as max_ts
       FROM location_pings
       WHERE vehicle_id IN (:vehicleIds)
       GROUP BY vehicle_id
     ) latest ON lp.vehicle_id = latest.vehicle_id AND lp.timestamp = latest.max_ts
     INNER JOIN vehicles v ON v.id = lp.vehicle_id`,
    { replacements: { vehicleIds }, type: sequelize.QueryTypes.SELECT },
  );

  return latestPings;
};

// ISSUE #8 FIXED: Movement summary for investigations
const getMovementSummary = async (vehicleId, fromDate, toDate) => {
  try {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const from = new Date(fromDate);
    const to = new Date(toDate);

    // Validate dates
    if (isNaN(from.getTime())) {
      throw new AppError(
        "Invalid 'from' date format. Use ISO 8601 format (e.g., 2026-05-04T14:00:00Z)",
        422,
      );
    }
    if (isNaN(to.getTime())) {
      throw new AppError(
        "Invalid 'to' date format. Use ISO 8601 format (e.g., 2026-05-04T16:00:00Z)",
        422,
      );
    }

    // Get all pings in time window
    const pings = await LocationPing.findAll({
      where: {
        vehicle_id: vehicleId,
        timestamp: { [Op.between]: [from, to] },
      },
      order: [["timestamp", "ASC"]],
    });

    if (pings.length === 0) {
      return {
        vehicle: {
          id: vehicle.id,
          registration_number: vehicle.registration_number,
          make: vehicle.make || "N/A",
          model: vehicle.model || "N/A",
        },
        time_window: {
          from: from.toISOString(),
          to: to.toISOString(),
          window_hours: (to - from) / (1000 * 60 * 60),
        },
        summary: {
          total_pings: 0,
          total_distance_km: 0,
          average_speed_kmh: 0,
          max_speed_kmh: 0,
          active_minutes: 0,
          stationary_minutes: 0,
          districts_visited: [],
          significant_movements_count: 0,
        },
        message: "No location data found for this time window",
      };
    }

    let totalDistance = 0;
    let maxSpeed = 0;
    let activeMinutes = 0;
    let stationaryMinutes = 0;
    const districtsVisited = new Set();
    const movementLog = [];

    // Calculate distances between consecutive pings
    for (let i = 0; i < pings.length; i++) {
      const ping = pings[i];

      // FIXED: Convert speed to number (handles decimal/string from DB)
      const currentSpeed = parseFloat(ping.speed) || 0;

      // Track districts visited
      if (ping.district_id) {
        const district = await District.findByPk(ping.district_id);
        if (district) districtsVisited.add(district.name);
      }

      // Track max speed - FIXED: ensure numeric comparison
      if (currentSpeed > maxSpeed) {
        maxSpeed = currentSpeed;
      }

      // Calculate movement between this ping and next
      if (i < pings.length - 1) {
        const nextPing = pings[i + 1];
        const currentTime = new Date(ping.timestamp);
        const nextTime = new Date(nextPing.timestamp);
        const timeDiffHours = (nextTime - currentTime) / (1000 * 60 * 60);

        // Only calculate if time difference is reasonable (avoid anomalies)
        if (timeDiffHours > 0 && timeDiffHours < 1) {
          // Less than 1 hour between pings
          const distance = calculateDistance(
            parseFloat(ping.latitude),
            parseFloat(ping.longitude),
            parseFloat(nextPing.latitude),
            parseFloat(nextPing.longitude),
          );

          totalDistance += distance;

          // Determine if vehicle was moving or stationary
          if (distance < 0.05) {
            // Less than 50 meters movement
            stationaryMinutes += timeDiffHours * 60;
          } else {
            activeMinutes += timeDiffHours * 60;
          }

          // Log significant movements (> 500 meters)
          if (distance > 0.5) {
            movementLog.push({
              from_time: ping.timestamp,
              to_time: nextPing.timestamp,
              from_location: {
                lat: parseFloat(ping.latitude),
                lng: parseFloat(ping.longitude),
              },
              to_location: {
                lat: parseFloat(nextPing.latitude),
                lng: parseFloat(nextPing.longitude),
              },
              distance_km: parseFloat(distance.toFixed(2)),
              duration_hours: parseFloat(timeDiffHours.toFixed(2)),
            });
          }
        }
      }
    }

    const totalMinutes = activeMinutes + stationaryMinutes;
    const averageSpeed =
      totalMinutes > 0 ? totalDistance / (totalMinutes / 60) : 0;

    // FIXED: Ensure all values are numbers before calling toFixed
    const safeToFixed = (value, decimals) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : parseFloat(num.toFixed(decimals));
    };

    return {
      vehicle: {
        id: vehicle.id,
        registration_number: vehicle.registration_number,
        make: vehicle.make || "N/A",
        model: vehicle.model || "N/A",
        status: vehicle.status,
      },
      time_window: {
        from: from.toISOString(),
        to: to.toISOString(),
        window_hours: safeToFixed((to - from) / (1000 * 60 * 60), 2),
      },
      summary: {
        total_pings: pings.length,
        total_distance_km: safeToFixed(totalDistance, 2),
        average_speed_kmh: safeToFixed(averageSpeed, 2),
        max_speed_kmh: safeToFixed(maxSpeed, 2),
        active_minutes: safeToFixed(activeMinutes, 1),
        stationary_minutes: safeToFixed(stationaryMinutes, 1),
        districts_visited: Array.from(districtsVisited),
        significant_movements_count: movementLog.length,
      },
      movement_log: movementLog.slice(0, 20),
    };
  } catch (error) {
    logger.error(`Movement summary error for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

module.exports = {
  postPing,
  getLatestLocation,
  getHistory,
  getLiveView,
  getMovementSummary,
};

const {
  Vehicle,
  Driver,
  Province,
  District,
  PoliceStation,
} = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess, buildPaginationMeta } = require("../utils/response");
const { Op } = require("sequelize");

/**
 * Get all vehicles with filtering and pagination
 * Supports geographic scope for PROVINCIAL_ADMIN and STATION_OFFICER
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const {
      province_id,
      district_id,
      status,
      page = 1,
      limit = 20,
      search,
    } = req.query;
    const { scope } = req;
    const where = {};

    // Apply geographic scope from authentication middleware
    if (scope.province_id) where.province_id = scope.province_id;
    if (scope.district_id) where.district_id = scope.district_id;

    // ISSUE #3: Filter by jurisdiction station if STATION_OFFICER
    if (scope.station_id && req.user.role === "STATION_OFFICER") {
      where.jurisdiction_station_id = scope.station_id;
    }

    // Apply query filters (override scope only for SUPER_ADMIN)
    if (province_id && !scope.province_id) where.province_id = province_id;
    if (district_id && !scope.district_id) where.district_id = district_id;
    if (status) where.status = status;

    // Search by registration or chassis number
    if (search) {
      where[Op.or] = [
        { registration_number: { [Op.like]: `%${search}%` } },
        { chassis_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      include: [
        {
          model: Driver,
          as: "driver",
          attributes: ["id", "full_name", "nic_number", "phone", "is_active"],
        },
        {
          model: Province,
          as: "province",
          attributes: ["id", "name", "code"],
        },
        {
          model: District,
          as: "district",
          attributes: ["id", "name", "code"],
        },
        {
          model: PoliceStation,
          as: "jurisdiction_station",
          attributes: ["id", "name", "code", "station_type"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return sendSuccess(
      res,
      200,
      "Vehicles retrieved",
      rows,
      buildPaginationMeta(page, limit, count),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single vehicle by ID with all associations
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: Driver, as: "driver" },
        { model: Province, as: "province" },
        { model: District, as: "district" },
        {
          model: PoliceStation,
          as: "jurisdiction_station",
          attributes: [
            "id",
            "name",
            "code",
            "station_type",
            "address",
            "phone",
          ],
        },
      ],
    });

    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Add ETag for caching (WSO2 Section 10.4)
    const etag = `"vehicle-${vehicle.id}-${vehicle.updatedAt.getTime()}"`;
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "private, max-age=60");

    return sendSuccess(res, 200, "Vehicle retrieved", vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle (SUPER_ADMIN only)
 * Also creates a corresponding DEVICE_CLIENT user for the GPS device
 */
const createVehicle = async (req, res, next) => {
  try {
    const { User } = require("../models");
    const bcrypt = require("bcryptjs");

    // Create the vehicle
    const vehicle = await Vehicle.create(req.body);

    // Create a DEVICE_CLIENT user for this vehicle's GPS device
    const deviceUsername = `device_${vehicle.device_imei.slice(-10)}`;
    const devicePassword = `Device@${vehicle.device_imei.slice(-8)}`;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(devicePassword, salt);

    await User.create({
      username: deviceUsername,
      email: `${vehicle.registration_number.toLowerCase()}@tracker.lk`,
      password_hash: hashedPassword,
      full_name: `${vehicle.make || "Bajaj"} ${vehicle.model || "RE"} - ${vehicle.registration_number}`,
      role: "DEVICE_CLIENT",
      province_id: vehicle.province_id,
      district_id: vehicle.district_id,
      is_active: true,
    });

    // WSO2 Section 7.3: Return Location header for newly created resource
    const locationUri = `/api/${process.env.API_VERSION || "v1"}/vehicles/${vehicle.id}`;

    return sendSuccess(
      res,
      201,
      "Vehicle registered successfully",
      vehicle,
      null,
      locationUri,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update vehicle details (SUPER_ADMIN or PROVINCIAL_ADMIN)
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Prevent updating critical identifiers (registration_number, chassis_number are immutable)
    const immutableFields = ["registration_number", "chassis_number"];
    const attemptedImmutableUpdate = immutableFields.filter(
      (field) => req.body[field] !== undefined,
    );

    if (attemptedImmutableUpdate.length > 0) {
      throw new AppError(
        `Cannot update immutable fields: ${attemptedImmutableUpdate.join(", ")}. These are legal identifiers.`,
        400,
      );
    }

    await vehicle.update(req.body);
    return sendSuccess(res, 200, "Vehicle updated", vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a vehicle (soft delete - preserves location history)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Soft delete: set status to INACTIVE instead of hard deleting
    // This preserves location_pings foreign key integrity
    await vehicle.update({ status: "INACTIVE" });

    return sendSuccess(res, 200, "Vehicle deactivated", {
      id: vehicle.id,
      registration_number: vehicle.registration_number,
      previous_status: vehicle.status,
      new_status: "INACTIVE",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ISSUE #7 FIXED: Assign or reassign a driver to a vehicle
 * Dedicated endpoint that only updates driver_id without needing full vehicle object
 */
const assignDriver = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const { driver_id } = req.body;

    // Find the vehicle
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Case 1: Unassign driver (driver_id = null)
    if (driver_id === null) {
      const previousDriverId = vehicle.driver_id;
      await vehicle.update({ driver_id: null });

      return sendSuccess(res, 200, "Driver unassigned from vehicle", {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        previous_driver_id: previousDriverId,
        driver_id: null,
        action: "unassigned",
      });
    }

    // Case 2: Assign a driver
    // Check if driver exists
    const driver = await Driver.findByPk(driver_id);
    if (!driver) throw new AppError("Driver not found", 404);

    // Check if driver is active
    if (!driver.is_active) {
      throw new AppError(
        `Cannot assign inactive driver: ${driver.full_name}`,
        400,
      );
    }

    // Check if driver is already assigned to another ACTIVE vehicle
    const existingAssignment = await Vehicle.findOne({
      where: {
        driver_id: driver_id,
        id: { [Op.ne]: vehicleId },
        status: "ACTIVE",
      },
    });

    if (existingAssignment) {
      throw new AppError(
        `Driver ${driver.full_name} is already assigned to vehicle ${existingAssignment.registration_number}. ` +
          `Unassign from that vehicle first or deactivate it.`,
        409,
      );
    }

    // Store previous driver for response
    const previousDriverId = vehicle.driver_id;

    // Assign the new driver
    await vehicle.update({ driver_id: driver_id });

    return sendSuccess(res, 200, "Driver assigned successfully", {
      vehicle_id: vehicle.id,
      registration_number: vehicle.registration_number,
      previous_driver_id: previousDriverId,
      driver_id: driver.id,
      driver_name: driver.full_name,
      driver_nic: driver.nic_number,
      action: "assigned",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ISSUE #3 FIXED: Assign vehicle to a police station's jurisdiction
 * This allows stations to have their own set of vehicles
 */
const assignStation = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const { station_id } = req.body;

    // Find the vehicle
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Case 1: Unassign from station (station_id = null)
    if (station_id === null) {
      const previousStationId = vehicle.jurisdiction_station_id;
      await vehicle.update({ jurisdiction_station_id: null });

      return sendSuccess(res, 200, "Station unassigned from vehicle", {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        previous_station_id: previousStationId,
        station_id: null,
        action: "unassigned",
      });
    }

    // Case 2: Assign to a station
    const station = await PoliceStation.findByPk(station_id);
    if (!station) throw new AppError("Police station not found", 404);

    const previousStationId = vehicle.jurisdiction_station_id;

    await vehicle.update({ jurisdiction_station_id: station_id });

    return sendSuccess(res, 200, `Vehicle assigned to ${station.name}`, {
      vehicle_id: vehicle.id,
      registration_number: vehicle.registration_number,
      previous_station_id: previousStationId,
      station_id: station.id,
      station_name: station.name,
      station_code: station.code,
      action: "assigned",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vehicles by station jurisdiction (helper for station officers)
 * Used when STATION_OFFICER needs to see their vehicles
 */
const getVehiclesByStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const station = await PoliceStation.findByPk(stationId);
    if (!station) throw new AppError("Police station not found", 404);

    const where = { jurisdiction_station_id: stationId };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      include: [
        {
          model: Driver,
          as: "driver",
          attributes: ["id", "full_name", "nic_number", "phone"],
        },
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        { model: District, as: "district", attributes: ["id", "name", "code"] },
      ],
      limit: parseInt(limit),
      offset,
      order: [["registration_number", "ASC"]],
    });

    return sendSuccess(
      res,
      200,
      `Vehicles under ${station.name}`,
      rows,
      buildPaginationMeta(page, limit, count),
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignDriver, // ISSUE #7: Driver assignment endpoint
  assignStation, // ISSUE #3: Station jurisdiction assignment
  getVehiclesByStation,
};

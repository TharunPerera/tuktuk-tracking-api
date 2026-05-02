const { Driver, Vehicle, Province, District } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess, buildPaginationMeta } = require("../utils/response");
const { Op } = require("sequelize");

const getAllDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { nic_number: { [Op.like]: `%${search}%` } },
        { license_number: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Driver.findAndCountAll({
      where,
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "registration_number", "status", "device_imei"],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["full_name", "ASC"]],
    });

    return sendSuccess(
      res,
      200,
      "Drivers retrieved",
      rows,
      buildPaginationMeta(page, limit, count),
    );
  } catch (error) {
    next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: [
            "id",
            "registration_number",
            "status",
            "device_imei",
            "make",
            "model",
            "year",
          ],
        },
      ],
    });

    if (!driver) throw new AppError("Driver not found", 404);

    // WSO2 Section 10.4 — Conditional GET with ETag
    const etag = `"driver-${driver.id}-${driver.updatedAt.getTime()}"`;
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "private, max-age=60");

    return sendSuccess(res, 200, "Driver retrieved", driver);
  } catch (error) {
    next(error);
  }
};

const createDriver = async (req, res, next) => {
  try {
    const driver = await Driver.create(req.body);

    // WSO2 Section 7.3: POST creation returns Location header
    const locationUri = `/api/${process.env.API_VERSION || "v1"}/drivers/${driver.id}`;

    return sendSuccess(
      res,
      201,
      "Driver registered successfully",
      driver,
      null,
      locationUri,
    );
  } catch (error) {
    next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) throw new AppError("Driver not found", 404);
    await driver.update(req.body);
    return sendSuccess(res, 200, "Driver updated", driver);
  } catch (error) {
    next(error);
  }
};

const deactivateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) throw new AppError("Driver not found", 404);

    // Block deactivation if driver has an active vehicle
    const activeVehicle = await Vehicle.findOne({
      where: { driver_id: driver.id, status: "ACTIVE" },
    });
    if (activeVehicle) {
      throw new AppError(
        "Cannot deactivate driver with an active vehicle. Reassign or deactivate the vehicle first.",
        409,
      );
    }

    await driver.update({ is_active: false });
    return sendSuccess(res, 200, "Driver deactivated");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
};

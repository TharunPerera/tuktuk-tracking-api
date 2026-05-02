const { Vehicle, Driver, Province, District } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess, buildPaginationMeta } = require("../utils/response");
const { Op } = require("sequelize");

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

    // Apply geographic scope (enforced by enforceScope middleware)
    if (scope.province_id) where.province_id = scope.province_id;
    if (scope.district_id) where.district_id = scope.district_id;

    // Apply query filters (only if not already scoped)
    if (province_id && !scope.province_id) where.province_id = province_id;
    if (district_id && !scope.district_id) where.district_id = district_id;
    if (status) where.status = status;
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
          attributes: ["id", "full_name", "nic_number", "phone"],
        },
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        { model: District, as: "district", attributes: ["id", "name", "code"] },
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

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: Driver, as: "driver" },
        { model: Province, as: "province" },
        { model: District, as: "district" },
      ],
    });

    if (!vehicle) throw new AppError("Vehicle not found", 404);
    return sendSuccess(res, 200, "Vehicle retrieved", vehicle);
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    // WSO2 Section 7.3: POST creation returns Location header
    // pointing to the URI of the newly created resource
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

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);
    await vehicle.update(req.body);
    return sendSuccess(res, 200, "Vehicle updated", vehicle);
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    // Soft delete — preserves location history integrity
    // Hard delete would orphan location_pings records
    await vehicle.update({ status: "INACTIVE" });
    return sendSuccess(res, 200, "Vehicle deactivated");
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
};

const {
  PoliceStation,
  District,
  Province,
  Vehicle,
  Driver,
} = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess, buildPaginationMeta } = require("../utils/response");
const { Op } = require("sequelize");

const getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.district_id) where.district_id = req.query.district_id;
    if (req.query.station_type) where.station_type = req.query.station_type;
    if (req.query.is_active !== undefined)
      where.is_active = req.query.is_active === "true";

    const stations = await PoliceStation.findAll({
      where,
      include: [
        {
          model: District,
          as: "district",
          attributes: ["id", "name", "code"],
          include: [
            {
              model: Province,
              as: "province",
              attributes: ["id", "name", "code"],
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
    });

    return sendSuccess(res, 200, "Police stations retrieved", stations);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByPk(req.params.id, {
      include: [
        {
          model: District,
          as: "district",
          include: [{ model: Province, as: "province" }],
        },
      ],
    });

    if (!station) throw new AppError("Police station not found", 404);
    return sendSuccess(res, 200, "Station retrieved", station);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const station = await PoliceStation.create(req.body);
    return sendSuccess(res, 201, "Police station created", station);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const station = await PoliceStation.findByPk(req.params.id);
    if (!station) throw new AppError("Police station not found", 404);
    await station.update(req.body);
    return sendSuccess(res, 200, "Station updated", station);
  } catch (error) {
    next(error);
  }
};

// ISSUE #6 FIXED: Get vehicles under a station's jurisdiction
const getStationVehicles = async (req, res, next) => {
  try {
    const stationId = req.params.id;
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

// ISSUE #3 FIXED: Assign vehicle to a station's jurisdiction
const assignVehicleToStation = async (req, res, next) => {
  try {
    const stationId = req.params.id;
    const vehicleId = req.params.vehicleId;

    const station = await PoliceStation.findByPk(stationId);
    if (!station) throw new AppError("Police station not found", 404);

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    await vehicle.update({ jurisdiction_station_id: stationId });

    return sendSuccess(
      res,
      200,
      `Vehicle ${vehicle.registration_number} assigned to ${station.name}`,
      {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        station_id: station.id,
        station_name: station.name,
      },
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  getStationVehicles,
  assignVehicleToStation,
};

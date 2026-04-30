const { PoliceStation, District, Province } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess } = require("../utils/response");

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

module.exports = { getAll, getById, create, update };

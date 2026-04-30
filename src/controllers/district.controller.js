const { District, Province, PoliceStation } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess } = require("../utils/response");

const getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.province_id) where.province_id = req.query.province_id;

    const districts = await District.findAll({
      where,
      include: [
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        {
          model: PoliceStation,
          as: "stations",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["name", "ASC"]],
    });
    return sendSuccess(res, 200, "Districts retrieved", districts);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const district = await District.findByPk(req.params.id, {
      include: [
        { model: Province, as: "province" },
        { model: PoliceStation, as: "stations" },
      ],
    });
    if (!district) throw new AppError("District not found", 404);
    return sendSuccess(res, 200, "District retrieved", district);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const district = await District.create(req.body);
    return sendSuccess(res, 201, "District created", district);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create };

const { Province, District } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess } = require("../utils/response");

const getAll = async (req, res, next) => {
  try {
    const provinces = await Province.findAll({
      include: [
        {
          model: District,
          as: "districts",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["name", "ASC"]],
    });
    return sendSuccess(res, 200, "Provinces retrieved", provinces);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const province = await Province.findByPk(req.params.id, {
      include: [{ model: District, as: "districts" }],
    });
    if (!province) throw new AppError("Province not found", 404);
    return sendSuccess(res, 200, "Province retrieved", province);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const province = await Province.create(req.body);
    return sendSuccess(res, 201, "Province created", province);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const province = await Province.findByPk(req.params.id);
    if (!province) throw new AppError("Province not found", 404);
    await province.update(req.body);
    return sendSuccess(res, 200, "Province updated", province);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update };

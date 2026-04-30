const { User, Province, District, PoliceStation } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const { sendSuccess, buildPaginationMeta } = require("../utils/response");
const { Op } = require("sequelize");

/**
 * GET /api/v1/users
 * List all users (SUPER_ADMIN only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, is_active } = req.query;

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === "true";
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        { model: District, as: "district", attributes: ["id", "name", "code"] },
        {
          model: PoliceStation,
          as: "station",
          attributes: ["id", "name", "code"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    return sendSuccess(
      res,
      200,
      "Users retrieved",
      rows,
      buildPaginationMeta(page, limit, count),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/users/:id
 * Get a single user
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        { model: District, as: "district", attributes: ["id", "name", "code"] },
        { model: PoliceStation, as: "station", attributes: ["id", "name"] },
      ],
    });

    if (!user) throw new AppError("User not found", 404);

    const etag = `"user-${user.id}-${user.updatedAt.getTime()}"`;
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", etag);

    return sendSuccess(res, 200, "User retrieved", user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/:id
 * Update a user (SUPER_ADMIN only)
 * Can update: role, province_id, district_id, station_id, is_active, full_name
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    // Prevent downgrading the last SUPER_ADMIN
    if (
      user.role === "SUPER_ADMIN" &&
      req.body.role &&
      req.body.role !== "SUPER_ADMIN"
    ) {
      const adminCount = await User.count({
        where: { role: "SUPER_ADMIN", is_active: true },
      });
      if (adminCount <= 1) {
        throw new AppError("Cannot demote the last active SUPER_ADMIN", 409);
      }
    }

    await user.update(req.body);
    return sendSuccess(res, 200, "User updated", user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/users/:id
 * Deactivate a user (soft delete)
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    // Cannot deactivate yourself
    if (user.id === req.user.id) {
      throw new AppError("You cannot deactivate your own account", 409);
    }

    await user.update({ is_active: false });
    return sendSuccess(res, 200, "User deactivated");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser };

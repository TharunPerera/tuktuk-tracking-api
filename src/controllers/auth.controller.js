const authService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password, req.ip);

    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);

    return sendSuccess(res, 200, "Token refreshed", result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    return sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { User, Province, District, PoliceStation } = require("../models");

    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Province, as: "province", attributes: ["id", "name", "code"] },
        { model: District, as: "district", attributes: ["id", "name", "code"] },
        {
          model: PoliceStation,
          as: "station",
          attributes: ["id", "name", "code"],
        },
      ],
    });

    return sendSuccess(res, 200, "Profile retrieved", user);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refresh, logout, getProfile };

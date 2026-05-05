const authService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response");
const { Vehicle } = require("../models");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password, req.ip);
    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

// ISSUE #1 & #2 FIXED: Device login by IMEI
const deviceLogin = async (req, res, next) => {
  try {
    const { device_imei } = req.body;

    // Find vehicle by IMEI
    const vehicle = await Vehicle.findOne({
      where: { device_imei, status: "ACTIVE" },
    });

    if (!vehicle) {
      return sendError(res, 401, "Invalid device IMEI or vehicle inactive");
    }

    // Generate JWT token for the device
    const accessToken = jwt.sign(
      {
        id: vehicle.id,
        username: `device_${device_imei.slice(-10)}`,
        role: "DEVICE_CLIENT",
        device_imei: device_imei,
        vehicle_id: vehicle.id,
        province_id: vehicle.province_id,
        district_id: vehicle.district_id,
        is_device: true,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" },
    );

    // Generate refresh token (shorter for devices - 24 hours)
    const refreshToken = jwt.sign(
      {
        vehicle_id: vehicle.id,
        device_imei: device_imei,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" },
    );

    return sendSuccess(res, 200, "Device authenticated successfully", {
      accessToken,
      refreshToken,
      device: {
        vehicle_id: vehicle.id,
        registration_number: vehicle.registration_number,
        device_imei: device_imei,
        status: vehicle.status,
      },
    });
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

module.exports = { login, deviceLogin, refresh, logout, getProfile };

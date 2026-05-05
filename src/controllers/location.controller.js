const locationService = require("../services/location.service");
const { sendSuccess } = require("../utils/response");
const { buildPaginationMeta } = require("../utils/response");

const postPing = async (req, res, next) => {
  try {
    // req.device comes from authenticateDevice middleware
    const pingData = {
      ...req.body,
      vehicle_id: req.device.vehicle_id,
    };
    const ping = await locationService.postPing(pingData);
    return sendSuccess(res, 201, "Location ping recorded", {
      ping_id: ping.id,
      vehicle_id: ping.vehicle_id,
      timestamp: ping.timestamp,
    });
  } catch (error) {
    next(error);
  }
};

const getLatestLocation = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const location = await locationService.getLatestLocation(vehicleId);
    return sendSuccess(res, 200, "Latest location retrieved", location);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { from, to, page, limit } = req.query;

    const result = await locationService.getHistory(
      vehicleId,
      from,
      to,
      page,
      limit,
    );

    return sendSuccess(
      res,
      200,
      "Location history retrieved",
      result.rows,
      buildPaginationMeta(page || 1, limit || 100, result.count),
    );
  } catch (error) {
    next(error);
  }
};

const getLiveView = async (req, res, next) => {
  try {
    const locations = await locationService.getLiveView(req.scope, req.query);
    return sendSuccess(res, 200, "Live vehicle locations", locations);
  } catch (error) {
    next(error);
  }
};

// ISSUE #8 FIXED: Movement summary endpoint for investigations
const getMovementSummary = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { from, to } = req.query;

    const summary = await locationService.getMovementSummary(
      vehicleId,
      from,
      to,
    );

    return sendSuccess(res, 200, "Movement summary generated", summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postPing,
  getLatestLocation,
  getHistory,
  getLiveView,
  getMovementSummary,
};

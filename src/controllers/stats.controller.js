const {
  Vehicle,
  Driver,
  LocationPing,
  Province,
  District,
} = require("../models");
const { sendSuccess } = require("../utils/response");
const { sequelize } = require("../config/database");

/**
 * GET /api/v1/stats
 * System-wide statistics for HQ dashboard
 * Access: SUPER_ADMIN, PROVINCIAL_ADMIN
 */
const getSystemStats = async (req, res, next) => {
  try {
    const { scope } = req;

    // Vehicle counts by status
    const vehicleWhere = {};
    if (scope.province_id) vehicleWhere.province_id = scope.province_id;
    if (scope.district_id) vehicleWhere.district_id = scope.district_id;

    const [
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      suspendedVehicles,
      totalDrivers,
      activeDrivers,
      totalPings,
      recentPings,
    ] = await Promise.all([
      Vehicle.count({ where: vehicleWhere }),
      Vehicle.count({ where: { ...vehicleWhere, status: "ACTIVE" } }),
      Vehicle.count({ where: { ...vehicleWhere, status: "INACTIVE" } }),
      Vehicle.count({ where: { ...vehicleWhere, status: "SUSPENDED" } }),
      Driver.count(),
      Driver.count({ where: { is_active: true } }),
      LocationPing.count(),
      LocationPing.count({
        where: {
          created_at: {
            [require("sequelize").Op.gte]: new Date(
              Date.now() - 24 * 60 * 60 * 1000,
            ),
          },
        },
      }),
    ]);

    // Vehicle breakdown by province (SUPER_ADMIN only)
    let byProvince = null;
    if (!scope.province_id && !scope.district_id) {
      const [results] = await sequelize.query(
        `
        SELECT p.name as province, p.code,
               COUNT(v.id) as total,
               SUM(CASE WHEN v.status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
               SUM(CASE WHEN v.status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive,
               SUM(CASE WHEN v.status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended
        FROM provinces p
        LEFT JOIN vehicles v ON v.province_id = p.id
        GROUP BY p.id, p.name, p.code
        ORDER BY p.name
      `,
        { type: sequelize.QueryTypes.SELECT },
      );
      byProvince = results;
    }

    // Pings in last hour (activity indicator)
    const [hourlyActivity] = await sequelize.query(
      `
      SELECT HOUR(timestamp) as hour, COUNT(*) as pings
      FROM location_pings
      WHERE timestamp >= NOW() - INTERVAL 24 HOUR
      GROUP BY HOUR(timestamp)
      ORDER BY hour ASC
      LIMIT 24
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    return sendSuccess(res, 200, "System statistics retrieved", {
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        inactive: inactiveVehicles,
        suspended: suspendedVehicles,
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
      },
      location_pings: {
        total: totalPings,
        last_24_hours: recentPings,
      },
      by_province: byProvince,
      hourly_activity: hourlyActivity,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stats/vehicles
 * Vehicle statistics breakdown (province/district level)
 */
const getVehicleStats = async (req, res, next) => {
  try {
    const { province_id, district_id } = req.query;
    const { scope } = req;

    const where = [];
    if (scope.province_id) where.push(`v.province_id = ${scope.province_id}`);
    if (scope.district_id) where.push(`v.district_id = ${scope.district_id}`);
    if (province_id && !scope.province_id)
      where.push(`v.province_id = ${province_id}`);
    if (district_id && !scope.district_id)
      where.push(`v.district_id = ${district_id}`);

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [byDistrict] = await sequelize.query(
      `
      SELECT d.name as district, d.code, p.name as province,
             COUNT(v.id) as total,
             SUM(CASE WHEN v.status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
             SUM(CASE WHEN v.status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended
      FROM districts d
      JOIN provinces p ON p.id = d.province_id
      LEFT JOIN vehicles v ON v.district_id = d.id
      ${whereClause}
      GROUP BY d.id, d.name, d.code, p.name
      ORDER BY total DESC
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    return sendSuccess(res, 200, "Vehicle statistics by district", byDistrict);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSystemStats, getVehicleStats };

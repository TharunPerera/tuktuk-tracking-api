const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { authenticate, authorize, enforceScope } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: System-wide monitoring and analytics
 */

router.use(generalLimiter, authenticate);

/**
 * @swagger
 * /stats:
 *   get:
 *     tags: [Statistics]
 *     summary: Get system-wide statistics (SUPER_ADMIN / PROVINCIAL_ADMIN)
 *     description: |
 *       Returns aggregated vehicle counts, driver counts, location ping totals,
 *       province-level breakdown, and 24-hour activity chart data.
 *       PROVINCIAL_ADMIN sees only their province's data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicles:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                         suspended:
 *                           type: integer
 *                     drivers:
 *                       type: object
 *                     location_pings:
 *                       type: object
 *                     by_province:
 *                       type: array
 *                     hourly_activity:
 *                       type: array
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 */
router.get(
  "/",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN"),
  enforceScope,
  statsController.getSystemStats,
);

/**
 * @swagger
 * /stats/vehicles:
 *   get:
 *     tags: [Statistics]
 *     summary: Vehicle statistics broken down by district
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter to a specific province
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter to a specific district
 *     responses:
 *       200:
 *         description: Vehicle breakdown by district
 */
router.get(
  "/vehicles",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  enforceScope,
  statsController.getVehicleStats,
);

module.exports = router;

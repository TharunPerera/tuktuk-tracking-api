const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");
const {
  authenticate,
  authorize,
  enforceScope,
  authenticateDevice,
} = require("../middleware/auth");
const { validate, validateQuery } = require("../middleware/validate");
const {
  locationPingSchema,
  historyQuerySchema,
} = require("../validations/location.validation");
const { deviceLimiter, generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Location
 *   description: GPS ping submission and location tracking
 */

/**
 * @swagger
 * /locations/ping:
 *   post:
 *     tags: [Location]
 *     summary: Submit GPS location ping (DEVICE_CLIENT or SUPER_ADMIN)
 *     description: GPS tracker devices call this every 30 seconds. Uses IMEI-based authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device_imei, latitude, longitude]
 *             properties:
 *               device_imei:
 *                 type: string
 *                 description: 15-digit IMEI of the GPS device
 *                 example: "35168235747426217"
 *               latitude:
 *                 type: number
 *                 description: GPS latitude (Sri Lanka range 5.5 to 10.5)
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 description: GPS longitude (Sri Lanka range 79.0 to 82.5)
 *                 example: 79.8612
 *               speed:
 *                 type: number
 *                 description: Speed in km/h
 *                 example: 35.5
 *               heading:
 *                 type: number
 *                 description: Compass bearing 0-360 degrees
 *                 example: 270
 *               accuracy:
 *                 type: number
 *                 description: GPS accuracy in meters
 *                 example: 5.0
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Device timestamp (ISO 8601)
 *                 example: "2026-05-04T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Ping recorded successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Vehicle suspended or inactive
 *       404:
 *         description: IMEI not registered
 *       422:
 *         description: Invalid coordinates or missing fields
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/ping",
  deviceLimiter,
  authenticateDevice,
  validate(locationPingSchema),
  locationController.postPing,
);

/**
 * @swagger
 * /locations/live:
 *   get:
 *     tags: [Location]
 *     summary: Get latest location of ALL active vehicles (Live Map View)
 *     description: Returns the most recent GPS ping for every active vehicle. PROVINCIAL_ADMIN and STATION_OFFICER see only their jurisdiction.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter by province (SUPER_ADMIN only)
 *         example: 1
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter by district
 *         example: 1
 *     responses:
 *       200:
 *         description: Array of latest GPS pings for all vehicles
 *       401:
 *         description: Authentication required
 */
router.get(
  "/live",
  generalLimiter,
  authenticate,
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  enforceScope,
  locationController.getLiveView,
);

/**
 * @swagger
 * /locations/{vehicleId}/live:
 *   get:
 *     tags: [Location]
 *     summary: Get latest location of a specific vehicle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle database ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Latest GPS ping for this vehicle
 *       404:
 *         description: Vehicle not found or no location data
 */
router.get(
  "/:vehicleId/live",
  generalLimiter,
  authenticate,
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  locationController.getLatestLocation,
);

/**
 * @swagger
 * /locations/{vehicleId}/history:
 *   get:
 *     tags: [Location]
 *     summary: Get movement history for a vehicle in a time window
 *     description: Returns all GPS pings for a vehicle between the given timestamps, in chronological order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *         example: 1
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of time window (ISO 8601) - REQUIRED
 *         example: "2026-05-04T14:00:00Z"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of time window (ISO 8601). Defaults to now.
 *         example: "2026-05-04T16:00:00Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
 *         example: 100
 *     responses:
 *       200:
 *         description: Paginated location history
 *       422:
 *         description: Missing required "from" parameter
 */
router.get(
  "/:vehicleId/history",
  generalLimiter,
  authenticate,
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  validateQuery(historyQuerySchema),
  locationController.getHistory,
);

/**
 * @swagger
 * /locations/{vehicleId}/summary:
 *   get:
 *     tags: [Location]
 *     summary: Get movement summary for a vehicle
 *     description: Returns analytics including distance traveled, average speed, districts visited, stationary periods.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *         example: 1
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of time window (ISO 8601)
 *         example: "2026-05-04T14:00:00Z"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of time window (ISO 8601). Defaults to now.
 *         example: "2026-05-04T16:00:00Z"
 *     responses:
 *       200:
 *         description: Movement summary calculated with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicle:
 *                       type: object
 *                     time_window:
 *                       type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_distance_km:
 *                           type: number
 *                         average_speed_kmh:
 *                           type: number
 *                         max_speed_kmh:
 *                           type: number
 *                         active_minutes:
 *                           type: number
 *                         stationary_minutes:
 *                           type: number
 *                         districts_visited:
 *                           type: array
 *                     movement_log:
 *                       type: array
 *       404:
 *         description: Vehicle not found
 *       422:
 *         description: Missing required "from" parameter
 */
router.get(
  "/:vehicleId/summary",
  generalLimiter,
  authenticate,
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  validateQuery(historyQuerySchema),
  locationController.getMovementSummary,
);

module.exports = router;

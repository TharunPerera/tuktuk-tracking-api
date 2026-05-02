const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");
const { authenticate, authorize, enforceScope } = require("../middleware/auth");
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
 *     description: GPS tracker devices call this every 30 seconds to report their location. Rate limited to 200 requests per 15 minutes.
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
 *                 example: "352148078300001"
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
 *                 example: "2026-04-28T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Ping recorded successfully
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
 *                     ping_id:
 *                       type: integer
 *                     vehicle_id:
 *                       type: integer
 *                     timestamp:
 *                       type: string
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
  authenticate,
  authorize("DEVICE_CLIENT", "SUPER_ADMIN"),
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
 *         description: Filter by province (SUPER_ADMIN only — others are auto-scoped)
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter by district
 *     responses:
 *       200:
 *         description: Array of latest GPS pings for all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vehicle_id:
 *                         type: integer
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       speed:
 *                         type: number
 *                       timestamp:
 *                         type: string
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
 *     description: Returns all GPS pings for a vehicle between the given timestamps, in chronological order. Use this to reconstruct the vehicle's route.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of time window (ISO 8601)
 *         example: "2026-04-21T00:00:00Z"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of time window (ISO 8601). Defaults to now.
 *         example: "2026-04-21T23:59:59Z"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           maximum: 1000
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

module.exports = router;

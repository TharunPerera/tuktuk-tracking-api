const express = require("express");
const router = express.Router();
const stationController = require("../controllers/station.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Geography
 *   description: Provinces, districts, and police stations (master data)
 */

/**
 * @swagger
 * /stations:
 *   get:
 *     tags: [Geography]
 *     summary: Get all police stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter by district ID
 *         example: 1
 *       - in: query
 *         name: station_type
 *         schema:
 *           type: string
 *           enum: [HEADQUARTERS, PROVINCIAL, DISTRICT]
 *         description: Filter by station type
 *         example: DISTRICT
 *     responses:
 *       200:
 *         description: Police stations with district and province info
 */
router.use(generalLimiter, authenticate);
router.get("/", stationController.getAll);

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     tags: [Geography]
 *     summary: Get a single police station by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Police station ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Station details with district and province
 *       404:
 *         description: Station not found
 */
router.get("/:id", stationController.getById);

/**
 * @swagger
 * /stations:
 *   post:
 *     tags: [Geography]
 *     summary: Create a new police station (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, district_id, station_type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fort Police Station
 *               code:
 *                 type: string
 *                 example: COL-FORT
 *               district_id:
 *                 type: integer
 *                 example: 1
 *               station_type:
 *                 type: string
 *                 enum: [HEADQUARTERS, PROVINCIAL, DISTRICT]
 *                 example: DISTRICT
 *               address:
 *                 type: string
 *                 example: Fort, Colombo 1
 *               phone:
 *                 type: string
 *                 example: "+94112421111"
 *     responses:
 *       201:
 *         description: Station created
 *       403:
 *         description: SUPER_ADMIN access required
 */
router.post("/", authorize("SUPER_ADMIN"), stationController.create);

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     tags: [Geography]
 *     summary: Update a police station (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Police station ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fort Police Station Updated
 *               phone:
 *                 type: string
 *                 example: "+94112421112"
 *               address:
 *                 type: string
 *                 example: New Address, Colombo 1
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Station updated
 *       404:
 *         description: Station not found
 */
router.put("/:id", authorize("SUPER_ADMIN"), stationController.update);

// ISSUE #6 FIXED: Station Vehicles Endpoint
/**
 * @swagger
 * /stations/{id}/vehicles:
 *   get:
 *     tags: [Geography]
 *     summary: Get all vehicles under a police station's jurisdiction
 *     description: Returns vehicles assigned to this specific station. STATION_OFFICER sees only their station's vehicles.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Police station ID
 *         example: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by vehicle status
 *         example: ACTIVE
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
 *           default: 20
 *           maximum: 100
 *         example: 20
 *     responses:
 *       200:
 *         description: List of vehicles under this station with pagination
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
 *                       id:
 *                         type: integer
 *                       registration_number:
 *                         type: string
 *                       driver:
 *                         type: object
 *                       status:
 *                         type: string
 *                 meta:
 *                   type: object
 *       404:
 *         description: Station not found
 */
router.get("/:id/vehicles", stationController.getStationVehicles);

// ISSUE #3 FIXED: Assign vehicle to station
/**
 * @swagger
 * /stations/{id}/vehicles/assign/{vehicleId}:
 *   post:
 *     tags: [Geography]
 *     summary: Assign a vehicle to a police station's jurisdiction
 *     description: Assign a vehicle to this station. SUPER_ADMIN or PROVINCIAL_ADMIN only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Police station ID
 *         example: 1
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID to assign
 *         example: 1
 *     responses:
 *       200:
 *         description: Vehicle assigned to station successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     vehicle_id:
 *                       type: integer
 *                     registration_number:
 *                       type: string
 *                     station_id:
 *                       type: integer
 *                     station_name:
 *                       type: string
 *       404:
 *         description: Station or vehicle not found
 *       403:
 *         description: Access denied
 */
router.post(
  "/:id/vehicles/assign/:vehicleId",
  authenticate,
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN"),
  stationController.assignVehicleToStation,
);

module.exports = router;

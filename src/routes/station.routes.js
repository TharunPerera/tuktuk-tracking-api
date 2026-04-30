const express = require("express");
const router = express.Router();
const stationController = require("../controllers/station.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

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
 *         description: Filter by district
 *         example: 1
 *       - in: query
 *         name: station_type
 *         schema:
 *           type: string
 *           enum: [HEADQUARTERS, PROVINCIAL, DISTRICT]
 *         description: Filter by station type
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
 *     summary: Get a single police station
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Station details
 *       404:
 *         description: Not found
 */
router.get("/:id", stationController.getById);

/**
 * @swagger
 * /stations:
 *   post:
 *     tags: [Geography]
 *     summary: Create a police station (SUPER_ADMIN only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Station updated
 */
router.put("/:id", authorize("SUPER_ADMIN"), stationController.update);

module.exports = router;

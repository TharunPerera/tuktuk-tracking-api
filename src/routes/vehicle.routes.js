const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicle.controller");
const { authenticate, authorize, enforceScope } = require("../middleware/auth");
const { validate, validateQuery } = require("../middleware/validate");
const {
  createVehicleSchema,
  updateVehicleSchema,
} = require("../validations/vehicle.validation");
const { vehicleFilterSchema } = require("../validations/location.validation");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Tuk-tuk vehicle registration and management
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get all registered vehicles
 *     description: Returns paginated list of vehicles. PROVINCIAL_ADMIN and STATION_OFFICER see only their jurisdiction automatically.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter by province ID
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: integer
 *         description: Filter by district ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by vehicle status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by registration or chassis number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Vehicles retrieved with pagination
 *       401:
 *         description: No token provided
 *       403:
 *         description: Access denied
 */
router.use(generalLimiter, authenticate);

router.get(
  "/",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  enforceScope,
  validateQuery(vehicleFilterSchema),
  vehicleController.getAllVehicles,
);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get a single vehicle by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details with driver and location info
 *       404:
 *         description: Vehicle not found
 */
router.get(
  "/:id",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  vehicleController.getVehicleById,
);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Register a new tuk-tuk (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [registration_number, chassis_number, province_id, district_id, device_imei]
 *             properties:
 *               registration_number:
 *                 type: string
 *                 example: WP-TEST-001
 *               chassis_number:
 *                 type: string
 *                 example: CHTEST000001
 *               driver_id:
 *                 type: integer
 *                 example: 1
 *               province_id:
 *                 type: integer
 *                 example: 1
 *               district_id:
 *                 type: integer
 *                 example: 1
 *               device_imei:
 *                 type: string
 *                 example: "123456789012345"
 *               make:
 *                 type: string
 *                 example: Bajaj
 *               model:
 *                 type: string
 *                 example: RE
 *               year:
 *                 type: integer
 *                 example: 2022
 *     responses:
 *       201:
 *         description: Vehicle registered
 *       403:
 *         description: Only SUPER_ADMIN can register vehicles
 *       409:
 *         description: Registration number or IMEI already exists
 */
router.post(
  "/",
  authorize("SUPER_ADMIN"),
  validate(createVehicleSchema),
  vehicleController.createVehicle,
);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     tags: [Vehicles]
 *     summary: Update vehicle details
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
 *               driver_id:
 *                 type: integer
 *               device_imei:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle updated
 *       404:
 *         description: Vehicle not found
 */
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN"),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle,
);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     tags: [Vehicles]
 *     summary: Deactivate a vehicle (soft delete — SUPER_ADMIN only)
 *     description: Does not delete from database. Sets status to INACTIVE to preserve location history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vehicle deactivated
 *       404:
 *         description: Vehicle not found
 */
router.delete(
  "/:id",
  authorize("SUPER_ADMIN"),
  vehicleController.deleteVehicle,
);

module.exports = router;

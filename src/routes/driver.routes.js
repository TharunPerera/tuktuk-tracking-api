const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driver.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, validateQuery } = require("../middleware/validate");
const {
  createDriverSchema,
  updateDriverSchema,
  driverFilterSchema,
} = require("../validations/driver.validation");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Tuk-tuk driver registration and management
 */

router.use(generalLimiter, authenticate);

/**
 * @swagger
 * /drivers:
 *   get:
 *     tags: [Drivers]
 *     summary: Get all registered drivers
 *     description: Returns paginated list of drivers. Supports search by name, NIC, license, or phone.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, NIC, license number, or phone
 *         example: "Driver 1"
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
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
 *         description: Paginated list of drivers with vehicle assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       nic_number:
 *                         type: string
 *                       license_number:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       vehicle:
 *                         type: object
 *                 meta:
 *                   type: object
 *       401:
 *         description: Authentication required
 */
router.get(
  "/",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  validateQuery(driverFilterSchema),
  driverController.getAllDrivers,
);

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     tags: [Drivers]
 *     summary: Get a single driver by ID
 *     description: Returns driver details including their assigned vehicle. Supports ETag caching.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Driver database ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Driver details with vehicle assignment
 *       304:
 *         description: Not Modified (ETag matched — use cached response)
 *       404:
 *         description: Driver not found
 */
router.get(
  "/:id",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN", "STATION_OFFICER"),
  driverController.getDriverById,
);

/**
 * @swagger
 * /drivers:
 *   post:
 *     tags: [Drivers]
 *     summary: Register a new driver (SUPER_ADMIN only)
 *     description: Creates a new tuk-tuk driver record. NIC and license number must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, nic_number, license_number]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Kamal Perera
 *               nic_number:
 *                 type: string
 *                 description: "Old format: 9 digits + V/X | New format: 12 digits"
 *                 example: 901234567V
 *               license_number:
 *                 type: string
 *                 example: LIC-999999
 *               phone:
 *                 type: string
 *                 example: "0771234567"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Colombo"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *     responses:
 *       201:
 *         description: Driver registered successfully
 *       403:
 *         description: Only SUPER_ADMIN can register drivers
 *       409:
 *         description: NIC or license number already exists
 *       422:
 *         description: Validation failed
 */
router.post(
  "/",
  authorize("SUPER_ADMIN"),
  validate(createDriverSchema),
  driverController.createDriver,
);

/**
 * @swagger
 * /drivers/{id}:
 *   put:
 *     tags: [Drivers]
 *     summary: Update driver details
 *     description: Update mutable driver fields. NIC and license number cannot be changed after creation.
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
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: "0771234567"
 *               address:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Driver updated
 *       404:
 *         description: Driver not found
 *       422:
 *         description: Validation failed (no fields provided)
 */
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "PROVINCIAL_ADMIN"),
  validate(updateDriverSchema),
  driverController.updateDriver,
);

/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     tags: [Drivers]
 *     summary: Deactivate a driver (soft delete — SUPER_ADMIN only)
 *     description: Sets is_active to false. Blocked if driver has an active vehicle assigned.
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
 *         description: Driver deactivated
 *       404:
 *         description: Driver not found
 *       409:
 *         description: Cannot deactivate driver with an active vehicle
 */
router.delete(
  "/:id",
  authorize("SUPER_ADMIN"),
  driverController.deactivateDriver,
);

module.exports = router;

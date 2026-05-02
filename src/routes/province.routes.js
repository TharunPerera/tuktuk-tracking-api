const express = require("express");
const router = express.Router();
const provinceController = require("../controllers/province.controller");
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
 * /provinces:
 *   get:
 *     tags: [Geography]
 *     summary: Get all 9 provinces with their districts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All provinces with nested district lists
 */
router.use(generalLimiter);
router.get("/", authenticate, provinceController.getAll);

/**
 * @swagger
 * /provinces/{id}:
 *   get:
 *     tags: [Geography]
 *     summary: Get a single province by ID
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
 *         description: Province details with districts
 *       404:
 *         description: Province not found
 */
router.get("/:id", authenticate, provinceController.getById);

/**
 * @swagger
 * /provinces:
 *   post:
 *     tags: [Geography]
 *     summary: Create a new province (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Western Province
 *               code:
 *                 type: string
 *                 example: WP
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *     responses:
 *       201:
 *         description: Province created
 *       409:
 *         description: Province already exists
 */
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  provinceController.create,
);

/**
 * @swagger
 * /provinces/{id}:
 *   put:
 *     tags: [Geography]
 *     summary: Update a province (SUPER_ADMIN only)
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
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Province updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  provinceController.update,
);

module.exports = router;

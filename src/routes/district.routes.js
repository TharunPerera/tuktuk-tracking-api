// const express = require("express");
// const router = express.Router();
// const districtController = require("../controllers/district.controller");
// const { authenticate, authorize } = require("../middleware/auth");
// const { generalLimiter } = require("../middleware/rateLimiter");

// router.use(generalLimiter, authenticate);
// router.get("/", districtController.getAll);
// router.get("/:id", districtController.getById);
// router.post("/", authorize("SUPER_ADMIN"), districtController.create);

// module.exports = router;

const express = require("express");
const router = express.Router();
const districtController = require("../controllers/district.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * /districts:
 *   get:
 *     tags: [Geography]
 *     summary: Get all 25 districts (optionally filtered by province)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter districts by province ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Districts with province info and stations
 */
router.use(generalLimiter, authenticate);
router.get("/", districtController.getAll);

/**
 * @swagger
 * /districts/{id}:
 *   get:
 *     tags: [Geography]
 *     summary: Get a single district by ID
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
 *         description: District with province and stations
 *       404:
 *         description: District not found
 */
router.get("/:id", districtController.getById);

/**
 * @swagger
 * /districts:
 *   post:
 *     tags: [Geography]
 *     summary: Create a new district (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, province_id]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Colombo
 *               code:
 *                 type: string
 *                 example: COL
 *               province_id:
 *                 type: integer
 *                 example: 1
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *     responses:
 *       201:
 *         description: District created
 */
router.post("/", authorize("SUPER_ADMIN"), districtController.create);

module.exports = router;

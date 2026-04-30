const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (SUPER_ADMIN only)
 */

router.use(generalLimiter, authenticate, authorize("SUPER_ADMIN"));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (SUPER_ADMIN only)
 *     description: Returns all system users with geographic scope and role info. Device clients are included.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, PROVINCIAL_ADMIN, STATION_OFFICER, DEVICE_CLIENT]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username, full name, or email
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: [true, false]
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
 *     responses:
 *       200:
 *         description: Paginated user list
 *       403:
 *         description: SUPER_ADMIN access required
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a single user by ID
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
 *         description: User details
 *       304:
 *         description: Not Modified (ETag match)
 *       404:
 *         description: User not found
 */
router.get("/:id", userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user's role or scope (SUPER_ADMIN only)
 *     description: Change a user's role, geographic scope, or active status. Cannot demote the last SUPER_ADMIN.
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
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, PROVINCIAL_ADMIN, STATION_OFFICER, DEVICE_CLIENT]
 *               province_id:
 *                 type: integer
 *               district_id:
 *                 type: integer
 *               station_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       409:
 *         description: Cannot demote last SUPER_ADMIN
 */
router.put("/:id", userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate a user (soft delete — SUPER_ADMIN only)
 *     description: Sets is_active to false. You cannot deactivate your own account.
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
 *         description: User deactivated
 *       409:
 *         description: Cannot deactivate your own account
 */
router.delete("/:id", userController.deactivateUser);

module.exports = router;

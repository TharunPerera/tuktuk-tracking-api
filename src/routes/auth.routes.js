const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  loginSchema,
  registerSchema,
  refreshSchema,
} = require("../validations/auth.validation");
const { authLimiter } = require("../middleware/rateLimiter");
const { User } = require("../models");
const { sendSuccess } = require("../utils/response");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Login, logout, token refresh, user registration
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login and get JWT tokens
 *     description: Returns an access token (15min) and refresh token (7 days). Use the accessToken as Bearer token for all other requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: hq_admin
 *               password:
 *                 type: string
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation failed
 *       429:
 *         description: Too many login attempts (rate limited)
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Use your refresh token to get a new access token without logging in again.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "your-refresh-token-here"
 *     responses:
 *       200:
 *         description: New access token returned
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", validate(refreshSchema), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout and revoke refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data returned
 *       401:
 *         description: No token provided
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user (SUPER_ADMIN only)
 *     description: Only HQ administrators can register new officers or device clients.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, full_name, role]
 *             properties:
 *               username:
 *                 type: string
 *                 example: new_officer
 *               email:
 *                 type: string
 *                 example: officer@police.lk
 *               password:
 *                 type: string
 *                 example: Officer@1234
 *               full_name:
 *                 type: string
 *                 example: John Silva
 *               role:
 *                 type: string
 *                 enum: [PROVINCIAL_ADMIN, STATION_OFFICER, DEVICE_CLIENT]
 *               province_id:
 *                 type: integer
 *                 example: 1
 *               district_id:
 *                 type: integer
 *                 example: 1
 *               station_id:
 *                 type: integer
 *                 example: 1
 *               badge_number:
 *                 type: string
 *                 example: COL-099
 *     responses:
 *       201:
 *         description: User registered
 *       403:
 *         description: Access denied — not SUPER_ADMIN
 *       409:
 *         description: Username or email already exists
 */
router.post(
  "/register",
  authenticate,
  authorize("SUPER_ADMIN"),
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const user = await User.create({
        ...req.body,
        password_hash: req.body.password,
      });
      return sendSuccess(res, 201, "User registered", {
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;

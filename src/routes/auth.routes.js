const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  loginSchema,
  registerSchema,
  refreshSchema,
  deviceLoginSchema,
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
 * /auth/device-login:
 *   post:
 *     tags: [Authentication]
 *     summary: GPS Device Login - Authenticate by IMEI
 *     description: GPS trackers authenticate using their IMEI number instead of username/password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [device_imei]
 *             properties:
 *               device_imei:
 *                 type: string
 *                 example: "35168235747426217"
 *     responses:
 *       200:
 *         description: Device authenticated successfully
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     device:
 *                       type: object
 *       401:
 *         description: Invalid IMEI or device inactive
 */
router.post(
  "/device-login",
  authLimiter,
  validate(deviceLoginSchema),
  authController.deviceLogin,
);

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
 *                     accessToken:
 *                       type: string
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
 *     description: Revokes the refresh token so it cannot be used again.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "your-refresh-token-here"
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile with role and geographic scope.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data returned
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
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                     province:
 *                       type: object
 *                     district:
 *                       type: object
 *                     station:
 *                       type: object
 *       401:
 *         description: No token provided or invalid token
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
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
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

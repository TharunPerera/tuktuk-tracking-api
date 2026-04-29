const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, RefreshToken } = require("../models");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");

// Generate a JWT access token (short-lived: 15 min)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      province_id: user.province_id,
      district_id: user.district_id,
      station_id: user.station_id,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" },
  );
};

// Generate a refresh token (long-lived: 7 days)
// The token itself is a random 64-byte hex string — not JWT
// This is more revocable than JWT for refresh tokens
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const login = async (username, password, ipAddress) => {
  // Use withPassword scope to include password_hash (excluded by default)
  const user = await User.scope("withPassword").findOne({
    where: { username },
  });

  if (!user) {
    throw new AppError("Invalid username or password", 401);
  }

  if (!user.is_active) {
    throw new AppError(
      "Account is deactivated. Contact your administrator.",
      403,
    );
  }

  const isValidPassword = await user.verifyPassword(password);
  if (!isValidPassword) {
    throw new AppError("Invalid username or password", 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();

  // Store hashed refresh token in DB
  await RefreshToken.create({
    user_id: user.id,
    token_hash: RefreshToken.hashToken(rawRefreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    issued_to_ip: ipAddress,
  });

  // Update last login
  await user.update({ last_login: new Date() });

  logger.info(`User logged in: ${username} from IP ${ipAddress}`);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      email: user.email,
    },
  };
};

const refresh = async (rawRefreshToken) => {
  const tokenHash = RefreshToken.hashToken(rawRefreshToken);

  const storedToken = await RefreshToken.findOne({
    where: { token_hash: tokenHash, is_revoked: false },
    include: [{ model: require("../models").User, as: "user" }],
  });

  if (!storedToken) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (new Date() > storedToken.expires_at) {
    await storedToken.destroy();
    throw new AppError("Refresh token expired. Please login again.", 401);
  }

  if (!storedToken.user.is_active) {
    throw new AppError("Account deactivated", 403);
  }

  // Generate new access token
  const accessToken = generateAccessToken(storedToken.user);

  return { accessToken };
};

const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

  const tokenHash = RefreshToken.hashToken(rawRefreshToken);
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token_hash: tokenHash } },
  );
};

module.exports = { login, refresh, logout };

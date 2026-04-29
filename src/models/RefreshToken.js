const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const crypto = require("crypto");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },

    // We store a HASH of the token, not the token itself
    // If our DB is compromised, attackers get hashes, not usable tokens
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Track which device/IP this token was issued to (audit trail)
    issued_to_ip: {
      type: DataTypes.STRING(45), // IPv6 can be 45 chars
      allowNull: true,
    },

    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["token_hash"] },
      { fields: ["expires_at"] },
    ],
  },
);

// Static method to hash a token before storing/comparing
RefreshToken.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = RefreshToken;

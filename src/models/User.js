const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        // Alphanumeric + underscores only for usernames
        is: /^[a-zA-Z0-9_]+$/i,
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // SUPER_ADMIN: HQ level, full access
    // PROVINCIAL_ADMIN: Province level
    // STATION_OFFICER: District/station level
    // DEVICE_CLIENT: GPS device, only posts location pings
    role: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "PROVINCIAL_ADMIN",
        "STATION_OFFICER",
        "DEVICE_CLIENT",
      ),
      allowNull: false,
      defaultValue: "STATION_OFFICER",
    },

    // Geographic scope — null means no restriction (used by SUPER_ADMIN)
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "provinces", key: "id" },
    },

    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "districts", key: "id" },
    },

    station_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "police_stations", key: "id" },
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Badge/officer ID for police officers
    badge_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,

    // IMPORTANT: Never return password_hash in API responses
    defaultScope: {
      attributes: { exclude: ["password_hash"] },
    },

    // Use this scope when you need to verify password (login)
    scopes: {
      withPassword: {
        attributes: { include: ["password_hash"] },
      },
    },
  },
);

// Instance method: verify a plain password against the stored hash
User.prototype.verifyPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

// Before saving a user, hash their password
// This hook runs automatically on User.create() and User.save()
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(12); // 12 rounds = secure but not too slow
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

module.exports = User;

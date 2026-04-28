const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Sri Lanka tuk-tuk plate format: typically XX-XXXX (e.g., WP-AB-1234)
    registration_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },

    chassis_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null if vehicle has no assigned driver
      references: { model: "drivers", key: "id" },
    },

    // Province where vehicle is registered (for jurisdiction)
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "provinces", key: "id" },
    },

    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "districts", key: "id" },
    },

    // IMEI = International Mobile Equipment Identity
    // This is the unique ID of the GPS tracker hardware installed in the tuk-tuk
    // The device uses this to authenticate when posting location pings
    device_imei: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [15, 17], // IMEI is 15 digits (sometimes with dashes = 17 chars)
      },
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },

    // Track make/model for records
    make: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Bajaj",
    },

    model: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "RE",
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1990, max: new Date().getFullYear() + 1 },
    },

    registered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vehicles",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["registration_number"] },
      { unique: true, fields: ["device_imei"] },
      { fields: ["province_id"] },
      { fields: ["district_id"] },
      { fields: ["status"] },
    ],
  },
);

module.exports = Vehicle;

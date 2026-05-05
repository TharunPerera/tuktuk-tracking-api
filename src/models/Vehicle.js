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
      allowNull: true,
      references: { model: "drivers", key: "id" },
    },
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
    // ISSUE #3 FIXED: Add jurisdiction_station_id for station-level assignment
    jurisdiction_station_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "police_stations", key: "id" },
      comment: "Police station responsible for this vehicle",
    },
    device_imei: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: { len: [15, 17] },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },
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
      { fields: ["jurisdiction_station_id"] }, // ISSUE #3: Index for station queries
      { fields: ["status"] },
    ],
  },
);

module.exports = Vehicle;

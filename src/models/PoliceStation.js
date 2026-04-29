const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PoliceStation = sequelize.define(
  "PoliceStation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // The type determines access level hierarchy
    // HEADQUARTERS > PROVINCIAL > DISTRICT
    station_type: {
      type: DataTypes.ENUM("HEADQUARTERS", "PROVINCIAL", "DISTRICT"),
      allowNull: false,
      defaultValue: "DISTRICT",
    },

    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "districts", key: "id" },
    },

    // Contact info
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "police_stations",
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ["district_id"] }],
  },
);

module.exports = PoliceStation;

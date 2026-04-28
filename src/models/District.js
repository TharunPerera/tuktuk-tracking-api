const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const District = sequelize.define(
  "District",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true },
    },

    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: { isUppercase: true },
    },

    // FK to Province — set in associations, not here
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "provinces",
        key: "id",
      },
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
  },
  {
    tableName: "districts",
    timestamps: true,
    underscored: true,
    indexes: [
      // Index on province_id because we frequently query "all districts in province X"
      { fields: ["province_id"] },
    ],
  },
);

module.exports = District;

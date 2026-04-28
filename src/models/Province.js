const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Province = sequelize.define(
  "Province",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },

    // Short code for filtering and display (e.g., WP, CP, SP)
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUppercase: true,
      },
    },

    // Province headquarters location (approximate center point)
    // Useful for map centering in future client apps
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
    tableName: "provinces",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Province;

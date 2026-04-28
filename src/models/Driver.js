const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Driver = sequelize.define(
  "Driver",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // NIC = National Identity Card number (Sri Lanka)
    nic_number: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        // Sri Lanka NIC: old format 9 digits + V/X, new format 12 digits
        is: /^([0-9]{9}[vVxX]|[0-9]{12})$/,
      },
    },

    license_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "drivers",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["nic_number"] },
      { unique: true, fields: ["license_number"] },
    ],
  },
);

module.exports = Driver;

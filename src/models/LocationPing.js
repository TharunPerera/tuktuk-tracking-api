const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const LocationPing = sequelize.define(
  "LocationPing",
  {
    id: {
      type: DataTypes.BIGINT, // BIGINT not INT — millions of rows expected
      primaryKey: true,
      autoIncrement: true,
    },

    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "vehicles", key: "id" },
    },

    // GPS coordinates
    // DECIMAL(10,8) for latitude = up to 10 digits, 8 after decimal = precision to ~1mm
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
      },
    },

    // DECIMAL(11,8) for longitude (extra digit for 100-180 degree values)
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
      },
    },

    // Speed in km/h — useful for detecting if tuk-tuk is moving or stationary
    speed: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: { min: 0, max: 200 },
    },

    // Compass heading in degrees (0-360)
    heading: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: { min: 0, max: 360 },
    },

    // GPS accuracy in meters (smaller = more accurate)
    accuracy: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      validate: { min: 0 },
    },

    // Exact time of the GPS reading (from the device clock)
    // This is different from created_at (server receive time)
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // Denormalized for fast province/district filtering
    // We store these here to avoid joining vehicles → districts → provinces
    // on every police query (which would be very slow at 4M+ rows)
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
  },
  {
    tableName: "location_pings",
    timestamps: true, // created_at = when server received the ping
    updatedAt: false, // We never update pings — they're immutable historical records
    underscored: true,
    indexes: [
      // PRIMARY query: get all pings for a vehicle in a time window
      { fields: ["vehicle_id", "timestamp"] },

      // Province/district filtering
      { fields: ["province_id", "timestamp"] },
      { fields: ["district_id", "timestamp"] },

      // Getting the LATEST ping for each vehicle (live view)
      // This query pattern: SELECT * FROM location_pings WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 1
      { fields: ["vehicle_id"], name: "idx_vehicle_latest" },

      // Timestamp alone for time-based cleanup jobs
      { fields: ["timestamp"] },
    ],
  },
);

module.exports = LocationPing;

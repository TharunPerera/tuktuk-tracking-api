const Province = require("./Province");
const District = require("./District");
const PoliceStation = require("./PoliceStation");
const User = require("./User");
const Driver = require("./Driver");
const Vehicle = require("./Vehicle");
const LocationPing = require("./LocationPing");
const RefreshToken = require("./RefreshToken");

// ==========================================
// DEFINE ASSOCIATIONS (Table Relationships)
// ==========================================

// Province <-> District: One province has many districts
Province.hasMany(District, { foreignKey: "province_id", as: "districts" });
District.belongsTo(Province, { foreignKey: "province_id", as: "province" });

// District <-> PoliceStation: One district has many stations
District.hasMany(PoliceStation, { foreignKey: "district_id", as: "stations" });
PoliceStation.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

// User scope associations
User.belongsTo(Province, { foreignKey: "province_id", as: "province" });
User.belongsTo(District, { foreignKey: "district_id", as: "district" });
User.belongsTo(PoliceStation, { foreignKey: "station_id", as: "station" });

// Driver <-> Vehicle: One driver can have one vehicle (for simplicity)
Driver.hasOne(Vehicle, { foreignKey: "driver_id", as: "vehicle" });
Vehicle.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// Vehicle geographic associations
Vehicle.belongsTo(Province, { foreignKey: "province_id", as: "province" });
Vehicle.belongsTo(District, { foreignKey: "district_id", as: "district" });

// Vehicle <-> LocationPing: One vehicle has many location pings (the core data flow)
Vehicle.hasMany(LocationPing, {
  foreignKey: "vehicle_id",
  as: "locationPings",
});
LocationPing.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

// LocationPing geographic (denormalized for fast queries)
LocationPing.belongsTo(Province, { foreignKey: "province_id", as: "province" });
LocationPing.belongsTo(District, { foreignKey: "district_id", as: "district" });

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  Province,
  District,
  PoliceStation,
  User,
  Driver,
  Vehicle,
  LocationPing,
  RefreshToken,
};

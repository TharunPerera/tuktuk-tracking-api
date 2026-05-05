const Province = require("./Province");
const District = require("./District");
const PoliceStation = require("./PoliceStation");
const User = require("./User");
const Driver = require("./Driver");
const Vehicle = require("./Vehicle");
const LocationPing = require("./LocationPing");
const RefreshToken = require("./RefreshToken");

// Province <-> District
Province.hasMany(District, { foreignKey: "province_id", as: "districts" });
District.belongsTo(Province, { foreignKey: "province_id", as: "province" });

// District <-> PoliceStation
District.hasMany(PoliceStation, { foreignKey: "district_id", as: "stations" });
PoliceStation.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

// User scope associations
User.belongsTo(Province, { foreignKey: "province_id", as: "province" });
User.belongsTo(District, { foreignKey: "district_id", as: "district" });
User.belongsTo(PoliceStation, { foreignKey: "station_id", as: "station" });

// Driver <-> Vehicle
Driver.hasOne(Vehicle, { foreignKey: "driver_id", as: "vehicle" });
Vehicle.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// Vehicle geographic associations
Vehicle.belongsTo(Province, { foreignKey: "province_id", as: "province" });
Vehicle.belongsTo(District, { foreignKey: "district_id", as: "district" });
// ISSUE #3 FIXED: Vehicle to PoliceStation association for jurisdiction
Vehicle.belongsTo(PoliceStation, {
  foreignKey: "jurisdiction_station_id",
  as: "jurisdiction_station",
});
PoliceStation.hasMany(Vehicle, {
  foreignKey: "jurisdiction_station_id",
  as: "jurisdiction_vehicles",
});

// Vehicle <-> LocationPing
Vehicle.hasMany(LocationPing, {
  foreignKey: "vehicle_id",
  as: "locationPings",
});
LocationPing.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

// LocationPing geographic
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

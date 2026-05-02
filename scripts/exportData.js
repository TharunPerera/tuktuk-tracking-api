require("dotenv").config();
const { sequelize } = require("../src/config/database");
const {
  Province,
  District,
  PoliceStation,
  Vehicle,
  Driver,
  LocationPing,
} = require("../src/models");
const fs = require("fs");
const path = require("path");
const logger = require("../src/utils/logger");

// ============================================================
// DATA EXPORT SCRIPT
// Exports simulation data to JSON and CSV for coursework submission
// Run: npm run export
// Output: exports/ directory
// ============================================================

const EXPORT_DIR = path.join(__dirname, "../exports");

const ensureExportDir = () => {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
};

const toCSV = (rows, headers) => {
  if (!rows || rows.length === 0) return headers.join(",");
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
};

const exportData = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected");
    ensureExportDir();
    logger.info(`📁 Export directory: ${EXPORT_DIR}`);
    logger.info("Starting data export...\n");

    // 1. PROVINCES
    logger.info("Exporting provinces...");
    const provinces = await Province.findAll({ raw: true });
    fs.writeFileSync(
      path.join(EXPORT_DIR, "provinces.json"),
      JSON.stringify(provinces, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "provinces.csv"),
      toCSV(provinces, ["id", "name", "code", "latitude", "longitude"]),
    );
    logger.info(`  ✅ ${provinces.length} provinces exported`);

    // 2. DISTRICTS
    logger.info("Exporting districts...");
    const rawDistricts = await District.findAll({
      include: [
        { model: Province, as: "province", attributes: ["name", "code"] },
      ],
      raw: true,
      nest: true,
    });
    const districtFlat = rawDistricts.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      province_name: d.province ? d.province.name : "",
      province_code: d.province ? d.province.code : "",
      latitude: d.latitude,
      longitude: d.longitude,
    }));
    fs.writeFileSync(
      path.join(EXPORT_DIR, "districts.json"),
      JSON.stringify(districtFlat, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "districts.csv"),
      toCSV(districtFlat, [
        "id",
        "name",
        "code",
        "province_name",
        "province_code",
        "latitude",
        "longitude",
      ]),
    );
    logger.info(`  ✅ ${rawDistricts.length} districts exported`);

    // 3. POLICE STATIONS
    logger.info("Exporting police stations...");
    const rawStations = await PoliceStation.findAll({
      include: [
        {
          model: District,
          as: "district",
          attributes: ["name", "code"],
          include: [{ model: Province, as: "province", attributes: ["name"] }],
        },
      ],
      raw: true,
      nest: true,
    });
    const stationFlat = rawStations.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      station_type: s.station_type,
      address: s.address || "",
      phone: s.phone || "",
      district_name: s.district ? s.district.name : "",
      province_name:
        s.district && s.district.province ? s.district.province.name : "",
    }));
    fs.writeFileSync(
      path.join(EXPORT_DIR, "stations.json"),
      JSON.stringify(stationFlat, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "stations.csv"),
      toCSV(stationFlat, [
        "id",
        "name",
        "code",
        "station_type",
        "address",
        "phone",
        "district_name",
        "province_name",
      ]),
    );
    logger.info(`  ✅ ${rawStations.length} stations exported`);

    // 4. DRIVERS
    logger.info("Exporting drivers...");
    const drivers = await Driver.findAll({ limit: 200, raw: true });
    fs.writeFileSync(
      path.join(EXPORT_DIR, "drivers.json"),
      JSON.stringify(drivers, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "drivers.csv"),
      toCSV(drivers, [
        "id",
        "full_name",
        "nic_number",
        "license_number",
        "phone",
        "address",
        "is_active",
      ]),
    );
    logger.info(`  ✅ ${drivers.length} drivers exported`);

    // 5. VEHICLES
    logger.info("Exporting vehicles...");
    const rawVehicles = await Vehicle.findAll({
      limit: 200,
      include: [
        {
          model: Driver,
          as: "driver",
          attributes: ["full_name", "nic_number"],
        },
        { model: Province, as: "province", attributes: ["name", "code"] },
        { model: District, as: "district", attributes: ["name", "code"] },
      ],
      raw: true,
      nest: true,
    });
    const vehicleFlat = rawVehicles.map((v) => ({
      id: v.id,
      registration_number: v.registration_number,
      chassis_number: v.chassis_number,
      device_imei: v.device_imei,
      status: v.status,
      make: v.make,
      model: v.model,
      year: v.year,
      driver_name: v.driver ? v.driver.full_name : "",
      province: v.province ? v.province.name : "",
      district: v.district ? v.district.name : "",
    }));
    fs.writeFileSync(
      path.join(EXPORT_DIR, "vehicles.json"),
      JSON.stringify(vehicleFlat, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "vehicles.csv"),
      toCSV(vehicleFlat, [
        "id",
        "registration_number",
        "chassis_number",
        "device_imei",
        "status",
        "make",
        "model",
        "year",
        "driver_name",
        "province",
        "district",
      ]),
    );
    logger.info(`  ✅ ${vehicleFlat.length} vehicles exported`);

    // 6. LOCATION PINGS SAMPLE (last 5000)
    logger.info("Exporting location ping sample (last 5000 pings)...");
    const pings = await LocationPing.findAll({
      limit: 5000,
      order: [["timestamp", "DESC"]],
      raw: true,
    });
    fs.writeFileSync(
      path.join(EXPORT_DIR, "location_pings_sample.json"),
      JSON.stringify(pings, null, 2),
    );
    fs.writeFileSync(
      path.join(EXPORT_DIR, "location_pings_sample.csv"),
      toCSV(pings, [
        "id",
        "vehicle_id",
        "latitude",
        "longitude",
        "speed",
        "heading",
        "accuracy",
        "timestamp",
        "province_id",
        "district_id",
      ]),
    );
    logger.info(`  ✅ ${pings.length} location pings exported (sample)`);

    // 7. SUMMARY STATS JSON
    logger.info("Generating summary stats...");
    const vehicleStats = await sequelize.query(
      `SELECT p.name as province, p.code,
              COUNT(v.id) as total_vehicles,
              SUM(CASE WHEN v.status = 'ACTIVE' THEN 1 ELSE 0 END) as active
       FROM provinces p
       LEFT JOIN vehicles v ON v.province_id = p.id
       GROUP BY p.id, p.name, p.code
       ORDER BY total_vehicles DESC`,
      { type: sequelize.QueryTypes.SELECT },
    );

    const totalPings = await LocationPing.count();

    const summary = {
      exported_at: new Date().toISOString(),
      totals: {
        provinces: provinces.length,
        districts: rawDistricts.length,
        police_stations: rawStations.length,
        drivers: drivers.length,
        vehicles: vehicleFlat.length,
        location_pings_total: totalPings,
        location_pings_exported: pings.length,
      },
      by_province: vehicleStats,
      simulation_patterns: {
        ping_interval_minutes: 5,
        night_hours: "23:00 - 05:00 (vehicles parked, sparse pings)",
        morning_rush: "07:00 - 09:00 (speed: 30-50 km/h, full drift)",
        evening_rush: "17:00 - 19:00 (speed: 30-50 km/h, full drift)",
        midday: "11:00 - 14:00 (60% activity, moderate speed)",
        weekday_vs_weekend: "Weekends: 60% of weekday activity",
        speed_range_kmh: "0 (night parked) to 50 (rush hour peak)",
      },
    };

    fs.writeFileSync(
      path.join(EXPORT_DIR, "summary.json"),
      JSON.stringify(summary, null, 2),
    );

    logger.info("\n🎉 Export complete!");
    logger.info(`📁 Files saved to: ${EXPORT_DIR}`);
    logger.info("\nExported files:");
    fs.readdirSync(EXPORT_DIR).forEach((f) => {
      const size = fs.statSync(path.join(EXPORT_DIR, f)).size;
      logger.info(`  ${f}  (${(size / 1024).toFixed(1)} KB)`);
    });

    process.exit(0);
  } catch (error) {
    logger.error("Export failed:", error.message);
    logger.error(error.stack);
    process.exit(1);
  }
};

exportData();

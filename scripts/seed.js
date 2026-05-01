// require("dotenv").config();
// const bcrypt = require("bcryptjs");
// const { sequelize } = require("../src/config/database");
// const {
//   Province,
//   District,
//   PoliceStation,
//   User,
//   Driver,
//   Vehicle,
//   LocationPing,
// } = require("../src/models");
// const logger = require("../src/utils/logger");

// // ===========================
// // MASTER DATA - ALL 9 PROVINCES
// // ===========================
// const PROVINCES = [
//   {
//     name: "Western Province",
//     code: "WP",
//     latitude: 6.9271,
//     longitude: 79.8612,
//   },
//   {
//     name: "Central Province",
//     code: "CP",
//     latitude: 7.2906,
//     longitude: 80.6337,
//   },
//   {
//     name: "Southern Province",
//     code: "SP",
//     latitude: 6.0535,
//     longitude: 80.221,
//   },
//   {
//     name: "Northern Province",
//     code: "NP",
//     latitude: 9.6615,
//     longitude: 80.0255,
//   },
//   {
//     name: "Eastern Province",
//     code: "EP",
//     latitude: 7.8731,
//     longitude: 81.6923,
//   },
//   {
//     name: "North Western Province",
//     code: "NWP",
//     latitude: 7.8731,
//     longitude: 80.275,
//   },
//   {
//     name: "North Central Province",
//     code: "NCP",
//     latitude: 8.3114,
//     longitude: 80.4037,
//   },
//   { name: "Uva Province", code: "UP", latitude: 6.9934, longitude: 81.055 },
//   {
//     name: "Sabaragamuwa Province",
//     code: "SGP",
//     latitude: 6.7056,
//     longitude: 80.3847,
//   },
// ];

// // ===========================
// // ALL 25 DISTRICTS
// // ===========================
// const DISTRICTS_BY_PROVINCE = {
//   WP: [
//     { name: "Colombo", code: "COL", latitude: 6.9271, longitude: 79.8612 },
//     { name: "Gampaha", code: "GAM", latitude: 7.0917, longitude: 79.9997 },
//     { name: "Kalutara", code: "KAL", latitude: 6.5854, longitude: 79.9607 },
//   ],
//   CP: [
//     { name: "Kandy", code: "KAN", latitude: 7.2906, longitude: 80.6337 },
//     { name: "Matale", code: "MAT", latitude: 7.4675, longitude: 80.6234 },
//     { name: "Nuwara Eliya", code: "NUW", latitude: 6.9497, longitude: 80.7891 },
//   ],
//   SP: [
//     { name: "Galle", code: "GAL", latitude: 6.0535, longitude: 80.221 },
//     { name: "Matara", code: "MTA", latitude: 5.9549, longitude: 80.555 },
//     { name: "Hambantota", code: "HAM", latitude: 6.1241, longitude: 81.1185 },
//   ],
//   NP: [
//     { name: "Jaffna", code: "JAF", latitude: 9.6615, longitude: 80.0255 },
//     { name: "Kilinochchi", code: "KIL", latitude: 9.3803, longitude: 80.377 },
//     { name: "Mannar", code: "MAN", latitude: 8.981, longitude: 79.9044 },
//     { name: "Mullaitivu", code: "MUL", latitude: 9.2671, longitude: 80.8128 },
//     { name: "Vavuniya", code: "VAV", latitude: 8.7514, longitude: 80.4971 },
//   ],
//   EP: [
//     { name: "Ampara", code: "AMP", latitude: 7.2992, longitude: 81.6724 },
//     { name: "Batticaloa", code: "BAT", latitude: 7.731, longitude: 81.6747 },
//     { name: "Trincomalee", code: "TRI", latitude: 8.5874, longitude: 81.2152 },
//   ],
//   NWP: [
//     { name: "Kurunegala", code: "KUR", latitude: 7.4818, longitude: 80.3609 },
//     { name: "Puttalam", code: "PUT", latitude: 8.0362, longitude: 79.8283 },
//   ],
//   NCP: [
//     { name: "Anuradhapura", code: "ANU", latitude: 8.3114, longitude: 80.4037 },
//     { name: "Polonnaruwa", code: "POL", latitude: 7.9403, longitude: 81.0188 },
//   ],
//   UP: [
//     { name: "Badulla", code: "BAD", latitude: 6.9934, longitude: 81.055 },
//     { name: "Monaragala", code: "MON", latitude: 6.8728, longitude: 81.3507 },
//   ],
//   SGP: [
//     { name: "Ratnapura", code: "RAT", latitude: 6.7056, longitude: 80.3847 },
//     { name: "Kegalle", code: "KEG", latitude: 7.2513, longitude: 80.3464 },
//   ],
// };

// // ===========================
// // POLICE STATIONS (25+)
// // ===========================
// const STATIONS_BY_DISTRICT = {
//   COL: [
//     {
//       name: "Colombo HQ",
//       code: "COL-HQ",
//       station_type: "HEADQUARTERS",
//       address: "Chatham Street, Colombo 1",
//     },
//     {
//       name: "Wellawatte Police Station",
//       code: "COL-WEL",
//       station_type: "DISTRICT",
//       address: "Wellawatte, Colombo 6",
//     },
//     {
//       name: "Maradana Police Station",
//       code: "COL-MAR",
//       station_type: "DISTRICT",
//       address: "Maradana, Colombo 10",
//     },
//   ],
//   GAM: [
//     {
//       name: "Gampaha Police Station",
//       code: "GAM-01",
//       station_type: "DISTRICT",
//       address: "Gampaha Town",
//     },
//     {
//       name: "Negombo Police Station",
//       code: "GAM-NEG",
//       station_type: "DISTRICT",
//       address: "Negombo",
//     },
//   ],
//   KAL: [
//     {
//       name: "Kalutara Police Station",
//       code: "KAL-01",
//       station_type: "DISTRICT",
//       address: "Kalutara Town",
//     },
//     {
//       name: "Panadura Police Station",
//       code: "KAL-PAN",
//       station_type: "DISTRICT",
//       address: "Panadura",
//     },
//   ],
//   KAN: [
//     {
//       name: "Kandy Police Station",
//       code: "KAN-01",
//       station_type: "PROVINCIAL",
//       address: "Kandy Town",
//     },
//     {
//       name: "Peradeniya Police Station",
//       code: "KAN-PER",
//       station_type: "DISTRICT",
//       address: "Peradeniya",
//     },
//   ],
//   GAL: [
//     {
//       name: "Galle Police Station",
//       code: "GAL-01",
//       station_type: "PROVINCIAL",
//       address: "Galle Fort",
//     },
//     {
//       name: "Unawatuna Police Station",
//       code: "GAL-UNA",
//       station_type: "DISTRICT",
//       address: "Unawatuna",
//     },
//   ],
//   JAF: [
//     {
//       name: "Jaffna Police Station",
//       code: "JAF-01",
//       station_type: "PROVINCIAL",
//       address: "Jaffna Town",
//     },
//   ],
//   TRI: [
//     {
//       name: "Trincomalee Police Station",
//       code: "TRI-01",
//       station_type: "DISTRICT",
//       address: "Trincomalee Town",
//     },
//   ],
//   KUR: [
//     {
//       name: "Kurunegala Police Station",
//       code: "KUR-01",
//       station_type: "PROVINCIAL",
//       address: "Kurunegala Town",
//     },
//   ],
//   ANU: [
//     {
//       name: "Anuradhapura Police Station",
//       code: "ANU-01",
//       station_type: "PROVINCIAL",
//       address: "Anuradhapura Town",
//     },
//   ],
//   RAT: [
//     {
//       name: "Ratnapura Police Station",
//       code: "RAT-01",
//       station_type: "PROVINCIAL",
//       address: "Ratnapura Town",
//     },
//   ],
//   MAT: [
//     {
//       name: "Matale Police Station",
//       code: "MAT-01",
//       station_type: "DISTRICT",
//       address: "Matale Town",
//     },
//   ],
//   MTA: [
//     {
//       name: "Matara Police Station",
//       code: "MTA-01",
//       station_type: "DISTRICT",
//       address: "Matara Town",
//     },
//   ],
//   BAD: [
//     {
//       name: "Badulla Police Station",
//       code: "BAD-01",
//       station_type: "DISTRICT",
//       address: "Badulla Town",
//     },
//   ],
//   BAT: [
//     {
//       name: "Batticaloa Police Station",
//       code: "BAT-01",
//       station_type: "DISTRICT",
//       address: "Batticaloa Town",
//     },
//   ],
//   POL: [
//     {
//       name: "Polonnaruwa Police Station",
//       code: "POL-01",
//       station_type: "DISTRICT",
//       address: "Polonnaruwa Town",
//     },
//   ],
// };

// // ===========================
// // SEED FUNCTION
// // ===========================
// const seed = async () => {
//   try {
//     await sequelize.authenticate();
//     logger.info("Starting database seeding...");

//     // -- PROVINCES --
//     logger.info("Seeding provinces...");
//     const provinceMap = {};
//     for (const p of PROVINCES) {
//       const [province] = await Province.findOrCreate({
//         where: { code: p.code },
//         defaults: p,
//       });
//       provinceMap[p.code] = province;
//     }
//     logger.info(`✅ ${PROVINCES.length} provinces seeded`);

//     // -- DISTRICTS --
//     logger.info("Seeding districts...");
//     const districtMap = {};
//     for (const [provinceCode, districts] of Object.entries(
//       DISTRICTS_BY_PROVINCE,
//     )) {
//       for (const d of districts) {
//         const [district] = await District.findOrCreate({
//           where: { code: d.code },
//           defaults: { ...d, province_id: provinceMap[provinceCode].id },
//         });
//         districtMap[d.code] = district;
//       }
//     }
//     logger.info(`✅ 25 districts seeded`);

//     // -- POLICE STATIONS --
//     logger.info("Seeding police stations...");
//     let stationCount = 0;
//     const stationMap = {};
//     for (const [districtCode, stations] of Object.entries(
//       STATIONS_BY_DISTRICT,
//     )) {
//       for (const s of stations) {
//         const [station] = await PoliceStation.findOrCreate({
//           where: { code: s.code },
//           defaults: { ...s, district_id: districtMap[districtCode]?.id },
//         });
//         stationMap[s.code] = station;
//         stationCount++;
//       }
//     }
//     logger.info(`✅ ${stationCount} police stations seeded`);

//     // -- ADMIN USER --
//     logger.info("Seeding admin user...");
//     const adminPassword = await bcrypt.hash("Admin@1234", 12);
//     await User.findOrCreate({
//       where: { username: "hq_admin" },
//       defaults: {
//         username: "hq_admin",
//         email: "admin@police.lk",
//         password_hash: adminPassword,
//         full_name: "HQ Administrator",
//         role: "SUPER_ADMIN",
//         badge_number: "HQ-001",
//       },
//     });

//     // Provincial admin for Western Province
//     const wpAdminPassword = await bcrypt.hash("WPAdmin@1234", 12);
//     await User.findOrCreate({
//       where: { username: "wp_admin" },
//       defaults: {
//         username: "wp_admin",
//         email: "wp@police.lk",
//         password_hash: wpAdminPassword,
//         full_name: "Western Province Admin",
//         role: "PROVINCIAL_ADMIN",
//         province_id: provinceMap["WP"].id,
//         badge_number: "WP-001",
//       },
//     });

//     // Station officer for Colombo
//     const officerPassword = await bcrypt.hash("Officer@1234", 12);
//     await User.findOrCreate({
//       where: { username: "col_officer" },
//       defaults: {
//         username: "col_officer",
//         email: "col@police.lk",
//         password_hash: officerPassword,
//         full_name: "Colombo Station Officer",
//         role: "STATION_OFFICER",
//         province_id: provinceMap["WP"].id,
//         district_id: districtMap["COL"].id,
//         station_id: stationMap["COL-HQ"].id,
//         badge_number: "COL-001",
//       },
//     });

//     logger.info("✅ Users seeded");

//     // -- DRIVERS (200) --
//     logger.info("Seeding 200 drivers...");
//     const drivers = [];
//     for (let i = 1; i <= 200; i++) {
//       const [driver] = await Driver.findOrCreate({
//         where: { nic_number: `${String(i).padStart(9, "0")}V` },
//         defaults: {
//           full_name: `Driver ${i}`,
//           nic_number: `${String(i).padStart(9, "0")}V`,
//           license_number: `LIC-${String(i).padStart(6, "0")}`,
//           phone: `077${String(i).padStart(7, "0")}`,
//           address: `No ${i}, Driver Street, Colombo`,
//         },
//       });
//       drivers.push(driver);
//     }
//     logger.info("✅ 200 drivers seeded");

//     // -- VEHICLES (200) --
//     logger.info("Seeding 200 vehicles...");
//     const vehicles = [];
//     const provinceCodes = Object.keys(provinceMap);

//     for (let i = 1; i <= 200; i++) {
//       const pCode = provinceCodes[i % provinceCodes.length];
//       const province = provinceMap[pCode];

//       // Find a district in this province
//       const districtCodes = Object.keys(DISTRICTS_BY_PROVINCE[pCode]);
//       const dCode =
//         DISTRICTS_BY_PROVINCE[pCode][i % DISTRICTS_BY_PROVINCE[pCode].length]
//           ?.code;
//       const district = districtMap[dCode];

//       if (!province || !district) continue;

//       const [vehicle] = await Vehicle.findOrCreate({
//         where: {
//           registration_number: `${pCode}-${String(i).padStart(4, "0")}`,
//         },
//         defaults: {
//           registration_number: `${pCode}-${String(i).padStart(4, "0")}`,
//           chassis_number: `CH${String(i).padStart(10, "0")}`,
//           driver_id: drivers[i - 1].id,
//           province_id: province.id,
//           district_id: district.id,
//           device_imei: `3521480783${String(i).padStart(5, "0")}`,
//           status: "ACTIVE",
//           make: "Bajaj",
//           model: "RE",
//           year: 2015 + (i % 9),
//         },
//       });

//       // Create DEVICE_CLIENT user for this vehicle
//       const devicePassword = await bcrypt.hash(
//         `device_${vehicle.device_imei}`,
//         10,
//       );
//       await User.findOrCreate({
//         where: { username: `device_${vehicle.device_imei}` },
//         defaults: {
//           username: `device_${vehicle.device_imei}`,
//           email: `device${i}@tracker.lk`,
//           password_hash: devicePassword,
//           full_name: `Device ${vehicle.registration_number}`,
//           role: "DEVICE_CLIENT",
//           province_id: province.id,
//           district_id: district.id,
//         },
//       });

//       vehicles.push({ vehicle, province, district });
//     }
//     logger.info(`✅ ${vehicles.length} vehicles and device users seeded`);

//     // -- LOCATION HISTORY (1 week) --
//     logger.info(
//       "Seeding 1 week of location history (this may take a few minutes)...",
//     );

//     const now = new Date();
//     const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
//     const pingInterval = 5 * 60 * 1000; // Every 5 minutes (300,000ms)
//     let totalPings = 0;
//     const pingBatch = [];

//     for (const { vehicle, province, district } of vehicles.slice(0, 200)) {
//       // Base location for this vehicle (near its registered district)
//       const baseLat = 6.0 + Math.random() * 3.0; // Sri Lanka lat range
//       const baseLng = 79.8 + Math.random() * 2.0; // Sri Lanka lng range

//       let currentTime = new Date(oneWeekAgo);
//       let currentLat = baseLat;
//       let currentLng = baseLng;

//       while (currentTime <= now) {
//         // Simulate movement: small random drift from previous location
//         const drift = 0.002;
//         currentLat += (Math.random() - 0.5) * drift;
//         currentLng += (Math.random() - 0.5) * drift;

//         // Keep within Sri Lanka bounds
//         currentLat = Math.max(5.9, Math.min(9.9, currentLat));
//         currentLng = Math.max(79.6, Math.min(81.9, currentLng));

//         pingBatch.push({
//           vehicle_id: vehicle.id,
//           latitude: parseFloat(currentLat.toFixed(8)),
//           longitude: parseFloat(currentLng.toFixed(8)),
//           speed: parseFloat((Math.random() * 60).toFixed(2)),
//           heading: parseFloat((Math.random() * 360).toFixed(2)),
//           accuracy: parseFloat((3 + Math.random() * 10).toFixed(2)),
//           timestamp: new Date(currentTime),
//           province_id: province.id,
//           district_id: district.id,
//           created_at: new Date(currentTime),
//         });

//         totalPings++;
//         currentTime = new Date(currentTime.getTime() + pingInterval);

//         // Insert in batches of 5000 to avoid memory overflow
//         if (pingBatch.length >= 5000) {
//           await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
//           pingBatch.length = 0;
//           logger.info(`  Inserted ${totalPings} pings so far...`);
//         }
//       }
//     }

//     // Insert remaining pings
//     if (pingBatch.length > 0) {
//       await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
//     }

//     logger.info(`✅ ${totalPings} location pings seeded (1 week of data)`);
//     logger.info("\n🎉 Database seeding complete!");
//     logger.info("\nDefault login credentials:");
//     logger.info("  Admin: username=hq_admin, password=Admin@1234");
//     logger.info("  WP Admin: username=wp_admin, password=WPAdmin@1234");
//     logger.info("  Officer: username=col_officer, password=Officer@1234");

//     process.exit(0);
//   } catch (error) {
//     logger.error("Seeding failed:", error);
//     process.exit(1);
//   }
// };

// seed();

require("dotenv").config();
const { sequelize } = require("../src/config/database");
const {
  Province,
  District,
  PoliceStation,
  User,
  Driver,
  Vehicle,
  LocationPing,
} = require("../src/models");
const logger = require("../src/utils/logger");

const PROVINCES = [
  {
    name: "Western Province",
    code: "WP",
    latitude: 6.9271,
    longitude: 79.8612,
  },
  {
    name: "Central Province",
    code: "CP",
    latitude: 7.2906,
    longitude: 80.6337,
  },
  {
    name: "Southern Province",
    code: "SP",
    latitude: 6.0535,
    longitude: 80.221,
  },
  {
    name: "Northern Province",
    code: "NP",
    latitude: 9.6615,
    longitude: 80.0255,
  },
  {
    name: "Eastern Province",
    code: "EP",
    latitude: 7.8731,
    longitude: 81.6923,
  },
  {
    name: "North Western Province",
    code: "NWP",
    latitude: 7.8731,
    longitude: 80.275,
  },
  {
    name: "North Central Province",
    code: "NCP",
    latitude: 8.3114,
    longitude: 80.4037,
  },
  { name: "Uva Province", code: "UP", latitude: 6.9934, longitude: 81.055 },
  {
    name: "Sabaragamuwa Province",
    code: "SGP",
    latitude: 6.7056,
    longitude: 80.3847,
  },
];

const DISTRICTS_BY_PROVINCE = {
  WP: [
    { name: "Colombo", code: "COL", latitude: 6.9271, longitude: 79.8612 },
    { name: "Gampaha", code: "GAM", latitude: 7.0917, longitude: 79.9997 },
    { name: "Kalutara", code: "KAL", latitude: 6.5854, longitude: 79.9607 },
  ],
  CP: [
    { name: "Kandy", code: "KAN", latitude: 7.2906, longitude: 80.6337 },
    { name: "Matale", code: "MAT", latitude: 7.4675, longitude: 80.6234 },
    { name: "Nuwara Eliya", code: "NUW", latitude: 6.9497, longitude: 80.7891 },
  ],
  SP: [
    { name: "Galle", code: "GAL", latitude: 6.0535, longitude: 80.221 },
    { name: "Matara", code: "MTA", latitude: 5.9549, longitude: 80.555 },
    { name: "Hambantota", code: "HAM", latitude: 6.1241, longitude: 81.1185 },
  ],
  NP: [
    { name: "Jaffna", code: "JAF", latitude: 9.6615, longitude: 80.0255 },
    { name: "Kilinochchi", code: "KIL", latitude: 9.3803, longitude: 80.377 },
    { name: "Mannar", code: "MAN", latitude: 8.981, longitude: 79.9044 },
    { name: "Mullaitivu", code: "MUL", latitude: 9.2671, longitude: 80.8128 },
    { name: "Vavuniya", code: "VAV", latitude: 8.7514, longitude: 80.4971 },
  ],
  EP: [
    { name: "Ampara", code: "AMP", latitude: 7.2992, longitude: 81.6724 },
    { name: "Batticaloa", code: "BAT", latitude: 7.731, longitude: 81.6747 },
    { name: "Trincomalee", code: "TRI", latitude: 8.5874, longitude: 81.2152 },
  ],
  NWP: [
    { name: "Kurunegala", code: "KUR", latitude: 7.4818, longitude: 80.3609 },
    { name: "Puttalam", code: "PUT", latitude: 8.0362, longitude: 79.8283 },
  ],
  NCP: [
    { name: "Anuradhapura", code: "ANU", latitude: 8.3114, longitude: 80.4037 },
    { name: "Polonnaruwa", code: "POL", latitude: 7.9403, longitude: 81.0188 },
  ],
  UP: [
    { name: "Badulla", code: "BAD", latitude: 6.9934, longitude: 81.055 },
    { name: "Monaragala", code: "MON", latitude: 6.8728, longitude: 81.3507 },
  ],
  SGP: [
    { name: "Ratnapura", code: "RAT", latitude: 6.7056, longitude: 80.3847 },
    { name: "Kegalle", code: "KEG", latitude: 7.2513, longitude: 80.3464 },
  ],
};

// const STATIONS_BY_DISTRICT = {
//   COL: [
//     {
//       name: "Colombo HQ",
//       code: "COL-HQ",
//       station_type: "HEADQUARTERS",
//       address: "Chatham Street, Colombo 1",
//     },
//     {
//       name: "Wellawatte Police Station",
//       code: "COL-WEL",
//       station_type: "DISTRICT",
//       address: "Wellawatte, Colombo 6",
//     },
//     {
//       name: "Maradana Police Station",
//       code: "COL-MAR",
//       station_type: "DISTRICT",
//       address: "Maradana, Colombo 10",
//     },
//   ],
//   GAM: [
//     {
//       name: "Gampaha Police Station",
//       code: "GAM-01",
//       station_type: "DISTRICT",
//       address: "Gampaha Town",
//     },
//     {
//       name: "Negombo Police Station",
//       code: "GAM-NEG",
//       station_type: "DISTRICT",
//       address: "Negombo",
//     },
//   ],
//   KAL: [
//     {
//       name: "Kalutara Police Station",
//       code: "KAL-01",
//       station_type: "DISTRICT",
//       address: "Kalutara Town",
//     },
//     {
//       name: "Panadura Police Station",
//       code: "KAL-PAN",
//       station_type: "DISTRICT",
//       address: "Panadura",
//     },
//   ],
//   KAN: [
//     {
//       name: "Kandy Police Station",
//       code: "KAN-01",
//       station_type: "PROVINCIAL",
//       address: "Kandy Town",
//     },
//     {
//       name: "Peradeniya Police Station",
//       code: "KAN-PER",
//       station_type: "DISTRICT",
//       address: "Peradeniya",
//     },
//   ],
//   GAL: [
//     {
//       name: "Galle Police Station",
//       code: "GAL-01",
//       station_type: "PROVINCIAL",
//       address: "Galle Fort",
//     },
//     {
//       name: "Unawatuna Police Station",
//       code: "GAL-UNA",
//       station_type: "DISTRICT",
//       address: "Unawatuna",
//     },
//   ],
//   JAF: [
//     {
//       name: "Jaffna Police Station",
//       code: "JAF-01",
//       station_type: "PROVINCIAL",
//       address: "Jaffna Town",
//     },
//   ],
//   TRI: [
//     {
//       name: "Trincomalee Police Station",
//       code: "TRI-01",
//       station_type: "DISTRICT",
//       address: "Trincomalee Town",
//     },
//   ],
//   KUR: [
//     {
//       name: "Kurunegala Police Station",
//       code: "KUR-01",
//       station_type: "PROVINCIAL",
//       address: "Kurunegala Town",
//     },
//   ],
//   ANU: [
//     {
//       name: "Anuradhapura Police Station",
//       code: "ANU-01",
//       station_type: "PROVINCIAL",
//       address: "Anuradhapura Town",
//     },
//   ],
//   RAT: [
//     {
//       name: "Ratnapura Police Station",
//       code: "RAT-01",
//       station_type: "PROVINCIAL",
//       address: "Ratnapura Town",
//     },
//   ],
//   MAT: [
//     {
//       name: "Matale Police Station",
//       code: "MAT-01",
//       station_type: "DISTRICT",
//       address: "Matale Town",
//     },
//   ],
//   MTA: [
//     {
//       name: "Matara Police Station",
//       code: "MTA-01",
//       station_type: "DISTRICT",
//       address: "Matara Town",
//     },
//   ],
//   BAD: [
//     {
//       name: "Badulla Police Station",
//       code: "BAD-01",
//       station_type: "DISTRICT",
//       address: "Badulla Town",
//     },
//   ],
//   BAT: [
//     {
//       name: "Batticaloa Police Station",
//       code: "BAT-01",
//       station_type: "DISTRICT",
//       address: "Batticaloa Town",
//     },
//   ],
//   POL: [
//     {
//       name: "Polonnaruwa Police Station",
//       code: "POL-01",
//       station_type: "DISTRICT",
//       address: "Polonnaruwa Town",
//     },
//   ],
// };

const STATIONS_BY_DISTRICT = {
  COL: [
    {
      name: "Colombo HQ",
      code: "COL-HQ",
      station_type: "HEADQUARTERS",
      address: "Chatham Street, Colombo 1",
      phone: "+94112421111", // ADD THIS
    },
    {
      name: "Wellawatte Police Station",
      code: "COL-WEL",
      station_type: "DISTRICT",
      address: "Wellawatte, Colombo 6",
      phone: "+94112364000",
    },
    {
      name: "Maradana Police Station",
      code: "COL-MAR",
      station_type: "DISTRICT",
      address: "Maradana, Colombo 10",
      phone: "+94112695641",
    },
  ],
  GAM: [
    {
      name: "Gampaha Police Station",
      code: "GAM-01",
      station_type: "DISTRICT",
      address: "Gampaha Town",
      phone: "+94332222222",
    },
    {
      name: "Negombo Police Station",
      code: "GAM-NEG",
      station_type: "DISTRICT",
      address: "Negombo",
      phone: "+94312222333",
    },
  ],
  KAL: [
    {
      name: "Kalutara Police Station",
      code: "KAL-01",
      station_type: "DISTRICT",
      address: "Kalutara Town",
      phone: "+94342222111",
    },
    {
      name: "Panadura Police Station",
      code: "KAL-PAN",
      station_type: "DISTRICT",
      address: "Panadura",
      phone: "+94382222555",
    },
  ],
  KAN: [
    {
      name: "Kandy Police Station",
      code: "KAN-01",
      station_type: "PROVINCIAL",
      address: "Kandy Town",
      phone: "+94812222222",
    },
    {
      name: "Peradeniya Police Station",
      code: "KAN-PER",
      station_type: "DISTRICT",
      address: "Peradeniya",
      phone: "+94812388000",
    },
  ],
  GAL: [
    {
      name: "Galle Police Station",
      code: "GAL-01",
      station_type: "PROVINCIAL",
      address: "Galle Fort",
      phone: "+94912222222",
    },
    {
      name: "Unawatuna Police Station",
      code: "GAL-UNA",
      station_type: "DISTRICT",
      address: "Unawatuna",
      phone: "+94912234567",
    },
  ],
  JAF: [
    {
      name: "Jaffna Police Station",
      code: "JAF-01",
      station_type: "PROVINCIAL",
      address: "Jaffna Town",
      phone: "+94212222222",
    },
  ],
  TRI: [
    {
      name: "Trincomalee Police Station",
      code: "TRI-01",
      station_type: "DISTRICT",
      address: "Trincomalee Town",
      phone: "+94262222222",
    },
  ],
  KUR: [
    {
      name: "Kurunegala Police Station",
      code: "KUR-01",
      station_type: "PROVINCIAL",
      address: "Kurunegala Town",
      phone: "+94372222222",
    },
  ],
  ANU: [
    {
      name: "Anuradhapura Police Station",
      code: "ANU-01",
      station_type: "PROVINCIAL",
      address: "Anuradhapura Town",
      phone: "+94252222222",
    },
  ],
  RAT: [
    {
      name: "Ratnapura Police Station",
      code: "RAT-01",
      station_type: "PROVINCIAL",
      address: "Ratnapura Town",
      phone: "+94452222222",
    },
  ],
  MAT: [
    {
      name: "Matale Police Station",
      code: "MAT-01",
      station_type: "DISTRICT",
      address: "Matale Town",
      phone: "+94662222222",
    },
  ],
  MTA: [
    {
      name: "Matara Police Station",
      code: "MTA-01",
      station_type: "DISTRICT",
      address: "Matara Town",
      phone: "+94412222222",
    },
  ],
  BAD: [
    {
      name: "Badulla Police Station",
      code: "BAD-01",
      station_type: "DISTRICT",
      address: "Badulla Town",
      phone: "+94552222222",
    },
  ],
  BAT: [
    {
      name: "Batticaloa Police Station",
      code: "BAT-01",
      station_type: "DISTRICT",
      address: "Batticaloa Town",
      phone: "+94652222222",
    },
  ],
  POL: [
    {
      name: "Polonnaruwa Police Station",
      code: "POL-01",
      station_type: "DISTRICT",
      address: "Polonnaruwa Town",
      phone: "+94272222222",
    },
  ],
};

// =============================================
// REALISTIC MOVEMENT PATTERN GENERATOR
// This addresses the coursework requirement:
// "Location history for at least one week in advance of the demo date (include patterns)"
// =============================================

// Returns a speed multiplier based on time of day
// Mimics real-world tuk-tuk behaviour in Sri Lanka:
// Rush hour (7-9am, 5-7pm): fast movement
// Midday: moderate movement
// Night (11pm-5am): parked/very slow — most tuk-tuks don't operate at night
const getSpeedMultiplier = (hour) => {
  if (hour >= 23 || hour < 5) return 0; // Night — parked (no movement)
  if (hour >= 7 && hour <= 9) return 1.0; // Morning rush — full speed
  if (hour >= 17 && hour <= 19) return 1.0; // Evening rush — full speed
  if (hour >= 11 && hour <= 14) return 0.6; // Midday — moderate
  if (hour >= 5 && hour < 7) return 0.3; // Early morning — starting up
  return 0.7; // Other times
};

// Returns movement drift based on hour
// During rush hours: larger drift = more distance covered
// At night: zero drift = vehicle stays at same location (parked)
const getMovementDrift = (hour) => {
  const multiplier = getSpeedMultiplier(hour);
  if (multiplier === 0) return 0;
  return 0.001 + multiplier * 0.003; // 0.001 to 0.004 degrees per ping
};

// Is it a weekday? Tuk-tuks are busier on weekdays
const isWeekday = (date) => {
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  return day >= 1 && day <= 5;
};

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Starting database seeding...");

    // -- PROVINCES --
    logger.info("Seeding provinces...");
    const provinceMap = {};
    for (const p of PROVINCES) {
      const [province] = await Province.findOrCreate({
        where: { code: p.code },
        defaults: p,
      });
      provinceMap[p.code] = province;
    }
    logger.info(`✅ ${PROVINCES.length} provinces seeded`);

    // -- DISTRICTS --
    logger.info("Seeding districts...");
    const districtMap = {};
    for (const [provinceCode, districts] of Object.entries(
      DISTRICTS_BY_PROVINCE,
    )) {
      for (const d of districts) {
        const [district] = await District.findOrCreate({
          where: { code: d.code },
          defaults: { ...d, province_id: provinceMap[provinceCode].id },
        });
        districtMap[d.code] = district;
      }
    }
    logger.info("✅ 25 districts seeded");

    // -- POLICE STATIONS --
    logger.info("Seeding police stations...");
    let stationCount = 0;
    const stationMap = {};
    for (const [districtCode, stations] of Object.entries(
      STATIONS_BY_DISTRICT,
    )) {
      for (const s of stations) {
        if (!districtMap[districtCode]) continue;
        const [station] = await PoliceStation.findOrCreate({
          where: { code: s.code },
          defaults: { ...s, district_id: districtMap[districtCode].id },
        });
        stationMap[s.code] = station;
        stationCount++;
      }
    }
    logger.info(`✅ ${stationCount} police stations seeded`);

    // -- USERS --
    logger.info("Seeding admin users...");

    // FIX: Pass PLAIN password — the User model beforeCreate hook hashes it automatically
    // DO NOT pre-hash here — that caused the double-hashing bug
    await User.findOrCreate({
      where: { username: "hq_admin" },
      defaults: {
        username: "hq_admin",
        email: "admin@police.lk",
        password_hash: "Admin@1234", // Plain text — hook hashes it
        full_name: "HQ Administrator",
        role: "SUPER_ADMIN",
        badge_number: "HQ-001",
      },
    });

    await User.findOrCreate({
      where: { username: "wp_admin" },
      defaults: {
        username: "wp_admin",
        email: "wp@police.lk",
        password_hash: "WPAdmin@1234", // Plain text — hook hashes it
        full_name: "Western Province Admin",
        role: "PROVINCIAL_ADMIN",
        province_id: provinceMap["WP"].id,
        badge_number: "WP-001",
      },
    });

    await User.findOrCreate({
      where: { username: "col_officer" },
      defaults: {
        username: "col_officer",
        email: "col@police.lk",
        password_hash: "Officer@1234", // Plain text — hook hashes it
        full_name: "Colombo Station Officer",
        role: "STATION_OFFICER",
        province_id: provinceMap["WP"].id,
        district_id: districtMap["COL"].id,
        station_id: stationMap["COL-HQ"].id,
        badge_number: "COL-001",
      },
    });

    logger.info("✅ Users seeded");

    // -- DRIVERS (200) --
    logger.info("Seeding 200 drivers...");
    const drivers = [];
    for (let i = 1; i <= 200; i++) {
      const [driver] = await Driver.findOrCreate({
        where: { nic_number: `${String(i).padStart(9, "0")}V` },
        defaults: {
          full_name: `Driver ${i}`,
          nic_number: `${String(i).padStart(9, "0")}V`,
          license_number: `LIC-${String(i).padStart(6, "0")}`,
          phone: `077${String(i).padStart(7, "0")}`,
          address: `No ${i}, Driver Street, Colombo`,
        },
      });
      drivers.push(driver);
    }
    logger.info("✅ 200 drivers seeded");

    // -- VEHICLES (200) --
    logger.info("Seeding 200 vehicles...");
    const vehicles = [];
    const provinceCodes = Object.keys(provinceMap);

    for (let i = 1; i <= 200; i++) {
      const pCode = provinceCodes[i % provinceCodes.length];
      const province = provinceMap[pCode];
      const districtList = DISTRICTS_BY_PROVINCE[pCode];
      const dCode = districtList[i % districtList.length].code;
      const district = districtMap[dCode];

      if (!province || !district) continue;

      const imei = `3521480783${String(i).padStart(5, "0")}`;

      const [vehicle] = await Vehicle.findOrCreate({
        where: {
          registration_number: `${pCode}-${String(i).padStart(4, "0")}`,
        },
        defaults: {
          registration_number: `${pCode}-${String(i).padStart(4, "0")}`,
          chassis_number: `CH${String(i).padStart(10, "0")}`,
          driver_id: drivers[i - 1].id,
          province_id: province.id,
          district_id: district.id,
          device_imei: imei,
          status: "ACTIVE",
          make: "Bajaj",
          model: "RE",
          year: 2015 + (i % 9),
        },
      });

      // Device user — plain password, hook hashes it
      await User.findOrCreate({
        where: { username: `device_${imei}` },
        defaults: {
          username: `device_${imei}`,
          email: `device${i}@tracker.lk`,
          password_hash: `Device@${imei}`, // Plain text — hook hashes it
          full_name: `Device ${vehicle.registration_number}`,
          role: "DEVICE_CLIENT",
          province_id: province.id,
          district_id: district.id,
        },
      });

      vehicles.push({ vehicle, province, district });
    }
    logger.info(`✅ ${vehicles.length} vehicles and device users seeded`);

    // -- LOCATION HISTORY WITH REALISTIC PATTERNS --
    logger.info(
      "Seeding 1 week of location history with realistic patterns...",
    );
    logger.info("Pattern rules:");
    logger.info("  - Night (11pm-5am): vehicles parked (no pings)");
    logger.info("  - Rush hours (7-9am, 5-7pm): active movement, higher speed");
    logger.info("  - Weekdays: more active than weekends");
    logger.info("  - Each vehicle starts at its registered district location");

    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const pingIntervalMinutes = 5; // Ping every 5 minutes
    const pingIntervalMs = pingIntervalMinutes * 60 * 1000;

    let totalPings = 0;
    let pingBatch = [];

    for (const { vehicle, province, district } of vehicles) {
      // Start each vehicle at its registered district's approximate location
      let currentLat =
        district.dataValues.latitude || 6.0 + Math.random() * 3.0;
      let currentLng =
        district.dataValues.longitude || 79.8 + Math.random() * 2.0;

      // Each vehicle has a "home base" it returns to at night
      const homeBaseLat = currentLat;
      const homeBaseLng = currentLng;

      let currentTime = new Date(oneWeekAgo);

      while (currentTime <= now) {
        const hour = currentTime.getHours(); // Hour in Sri Lanka time
        const speedMultiplier = getSpeedMultiplier(hour);
        const weekdayBonus = isWeekday(currentTime) ? 1.0 : 0.6; // Less active on weekends

        // Night time: snap back near home base (parked), skip pings
        if (speedMultiplier === 0) {
          // Vehicle is parked — gradually drift back to home base
          currentLat = homeBaseLat + (Math.random() - 0.5) * 0.0005;
          currentLng = homeBaseLng + (Math.random() - 0.5) * 0.0005;
          // Still insert a ping every 30 mins at night (shows "last seen parked")
          // but only every 6th interval (5min × 6 = 30min)
          if (Math.floor(currentTime.getTime() / pingIntervalMs) % 6 !== 0) {
            currentTime = new Date(currentTime.getTime() + pingIntervalMs);
            continue;
          }
        } else {
          // Active hours: move the vehicle
          const drift = getMovementDrift(hour) * weekdayBonus;
          currentLat += (Math.random() - 0.5) * drift;
          currentLng += (Math.random() - 0.5) * drift;
        }

        // Keep within Sri Lanka geographic bounds
        currentLat = Math.max(5.9, Math.min(9.9, currentLat));
        currentLng = Math.max(79.6, Math.min(81.9, currentLng));

        // Realistic speed based on hour
        // Rush hour: 20-50 km/h (city traffic), Night: 0
        const baseSpeed = speedMultiplier * weekdayBonus * 50;
        const speed =
          speedMultiplier === 0
            ? 0
            : Math.max(0, baseSpeed + (Math.random() - 0.5) * 20);

        pingBatch.push({
          vehicle_id: vehicle.id,
          latitude: parseFloat(currentLat.toFixed(8)),
          longitude: parseFloat(currentLng.toFixed(8)),
          speed: parseFloat(speed.toFixed(2)),
          heading: parseFloat((Math.random() * 360).toFixed(2)),
          accuracy: parseFloat((3 + Math.random() * 7).toFixed(2)),
          timestamp: new Date(currentTime),
          province_id: province.id,
          district_id: district.id,
          created_at: new Date(currentTime),
        });

        totalPings++;
        currentTime = new Date(currentTime.getTime() + pingIntervalMs);

        // Bulk insert every 5000 pings to avoid memory issues
        if (pingBatch.length >= 5000) {
          await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
          pingBatch = [];
          logger.info(`  Inserted ${totalPings} pings so far...`);
        }
      }
    }

    if (pingBatch.length > 0) {
      await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
    }

    logger.info(
      `✅ ${totalPings} location pings seeded with realistic patterns`,
    );
    logger.info("\n🎉 Database seeding complete!");
    logger.info("\n📋 Test Login Credentials:");
    logger.info(
      "  SUPER_ADMIN:      username=hq_admin,    password=Admin@1234",
    );
    logger.info(
      "  PROVINCIAL_ADMIN: username=wp_admin,    password=WPAdmin@1234",
    );
    logger.info(
      "  STATION_OFFICER:  username=col_officer, password=Officer@1234",
    );
    logger.info(
      "  DEVICE_CLIENT:    username=device_3521480783{00001-00200}, password=Device@{imei}",
    );

    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();

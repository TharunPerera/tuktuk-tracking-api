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

// Sri Lanka Real Names Database
const DRIVER_FIRST_NAMES = [
  "Kamal",
  "Sunil",
  "Nimal",
  "Priyantha",
  "Ranjith",
  "Samaraweera",
  "Bandula",
  "Mahinda",
  "Siripala",
  "Somapala",
  "Gamini",
  "Hemasiri",
  "Lalith",
  "Dayan",
  "Ravindra",
  "Chandana",
  "Anura",
  "Prasanna",
  "Ajith",
  "Rohan",
  "Dammika",
  "Upali",
  "Indika",
  "Jagath",
  "Mahesh",
];

const DRIVER_LAST_NAMES = [
  "Perera",
  "Silva",
  "Bandara",
  "Jayawardena",
  "Fernando",
  "Weerasinghe",
  "Dissanayake",
  "Rathnayake",
  "Kumara",
  "Wickramasinghe",
  "Gunasekara",
  "Herath",
  "Liyanage",
  "Samarawickrama",
  "Abeysinghe",
  "Rajapaksa",
];

const VEHICLE_MAKES = ["Bajaj", "TVS", "Piaggio", "Mahindra", "Atul"];
const VEHICLE_MODELS = [
  "RE",
  "RE EFI",
  "King",
  "Grand",
  "Leader",
  "Compact",
  "Deluxe",
];
const VEHICLE_YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i);

// Sri Lanka cities with valid coordinates for each district
const DISTRICT_CITIES = {
  Colombo: { lat: 6.9271, lng: 79.8612, city: "Colombo" },
  Gampaha: { lat: 7.0917, lng: 79.9997, city: "Gampaha" },
  Kalutara: { lat: 6.5854, lng: 79.9607, city: "Kalutara" },
  Kandy: { lat: 7.2906, lng: 80.6337, city: "Kandy" },
  Matale: { lat: 7.4675, lng: 80.6234, city: "Matale" },
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891, city: "Nuwara Eliya" },
  Galle: { lat: 6.0535, lng: 80.221, city: "Galle" },
  Matara: { lat: 5.9549, lng: 80.555, city: "Matara" },
  Hambantota: { lat: 6.1241, lng: 81.1185, city: "Hambantota" },
  Jaffna: { lat: 9.6615, lng: 80.0255, city: "Jaffna" },
  Kilinochchi: { lat: 9.3803, lng: 80.377, city: "Kilinochchi" },
  Mannar: { lat: 8.981, lng: 79.9044, city: "Mannar" },
  Mullaitivu: { lat: 9.2671, lng: 80.8128, city: "Mullaitivu" },
  Vavuniya: { lat: 8.7514, lng: 80.4971, city: "Vavuniya" },
  Ampara: { lat: 7.2992, lng: 81.6724, city: "Ampara" },
  Batticaloa: { lat: 7.731, lng: 81.6747, city: "Batticaloa" },
  Trincomalee: { lat: 8.5874, lng: 81.2152, city: "Trincomalee" },
  Kurunegala: { lat: 7.4818, lng: 80.3609, city: "Kurunegala" },
  Puttalam: { lat: 8.0362, lng: 79.8283, city: "Puttalam" },
  Anuradhapura: { lat: 8.3114, lng: 80.4037, city: "Anuradhapura" },
  Polonnaruwa: { lat: 7.9403, lng: 81.0188, city: "Polonnaruwa" },
  Badulla: { lat: 6.9934, lng: 81.055, city: "Badulla" },
  Monaragala: { lat: 6.8728, lng: 81.3507, city: "Monaragala" },
  Ratnapura: { lat: 6.7056, lng: 80.3847, city: "Ratnapura" },
  Kegalle: { lat: 7.2513, lng: 80.3464, city: "Kegalle" },
};

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

// COMPLETE POLICE STATIONS FOR ALL 25 DISTRICTS
const STATIONS_BY_DISTRICT = {
  // Western Province - 3 districts
  COL: [
    {
      name: "Colombo Fort Police Station",
      code: "COL-FORT",
      station_type: "HEADQUARTERS",
      address: "Chatham Street, Colombo 01",
      phone: "+94112421111",
    },
    {
      name: "Colombo Pettah Station",
      code: "COL-PET",
      station_type: "DISTRICT",
      address: "Pettah, Colombo 11",
      phone: "+94112456789",
    },
    {
      name: "Colombo Wellawatte Station",
      code: "COL-WEL",
      station_type: "DISTRICT",
      address: "Wellawatte, Colombo 06",
      phone: "+94112564000",
    },
  ],
  GAM: [
    {
      name: "Gampaha Police Station",
      code: "GAM-HQ",
      station_type: "DISTRICT",
      address: "Gampaha Town",
      phone: "+94332222222",
    },
    {
      name: "Negombo Police Station",
      code: "GAM-NEG",
      station_type: "DISTRICT",
      address: "Negombo",
      phone: "+94312222222",
    },
  ],
  KAL: [
    {
      name: "Kalutara Police Station",
      code: "KAL-HQ",
      station_type: "DISTRICT",
      address: "Kalutara Town",
      phone: "+94342222222",
    },
    {
      name: "Panadura Police Station",
      code: "KAL-PAN",
      station_type: "DISTRICT",
      address: "Panadura",
      phone: "+94382222222",
    },
  ],
  // Central Province - 3 districts
  KAN: [
    {
      name: "Kandy Police Station",
      code: "KAN-HQ",
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
  MAT: [
    {
      name: "Matale Police Station",
      code: "MAT-HQ",
      station_type: "DISTRICT",
      address: "Matale Town",
      phone: "+94662222222",
    },
  ],
  NUW: [
    {
      name: "Nuwara Eliya Police Station",
      code: "NUW-HQ",
      station_type: "DISTRICT",
      address: "Nuwara Eliya",
      phone: "+94522222222",
    },
  ],
  // Southern Province - 3 districts
  GAL: [
    {
      name: "Galle Police Station",
      code: "GAL-HQ",
      station_type: "PROVINCIAL",
      address: "Galle Fort",
      phone: "+94912222222",
    },
  ],
  MTA: [
    {
      name: "Matara Police Station",
      code: "MTA-HQ",
      station_type: "DISTRICT",
      address: "Matara Town",
      phone: "+94412222222",
    },
  ],
  HAM: [
    {
      name: "Hambantota Police Station",
      code: "HAM-HQ",
      station_type: "DISTRICT",
      address: "Hambantota",
      phone: "+94472222222",
    },
    {
      name: "Tangalle Police Station",
      code: "HAM-TAN",
      station_type: "DISTRICT",
      address: "Tangalle",
      phone: "+94472222223",
    },
  ],
  // Northern Province - 5 districts
  JAF: [
    {
      name: "Jaffna Police Station",
      code: "JAF-HQ",
      station_type: "PROVINCIAL",
      address: "Jaffna Town",
      phone: "+94212222222",
    },
  ],
  KIL: [
    {
      name: "Kilinochchi Police Station",
      code: "KIL-HQ",
      station_type: "DISTRICT",
      address: "Kilinochchi",
      phone: "+94232222222",
    },
  ],
  MAN: [
    {
      name: "Mannar Police Station",
      code: "MAN-HQ",
      station_type: "DISTRICT",
      address: "Mannar",
      phone: "+94242222222",
    },
  ],
  MUL: [
    {
      name: "Mullaitivu Police Station",
      code: "MUL-HQ",
      station_type: "DISTRICT",
      address: "Mullaitivu",
      phone: "+94252222222",
    },
  ],
  VAV: [
    {
      name: "Vavuniya Police Station",
      code: "VAV-HQ",
      station_type: "DISTRICT",
      address: "Vavuniya",
      phone: "+94262222222",
    },
  ],
  // Eastern Province - 3 districts
  AMP: [
    {
      name: "Ampara Police Station",
      code: "AMP-HQ",
      station_type: "DISTRICT",
      address: "Ampara",
      phone: "+94272222222",
    },
  ],
  BAT: [
    {
      name: "Batticaloa Police Station",
      code: "BAT-HQ",
      station_type: "DISTRICT",
      address: "Batticaloa",
      phone: "+94652222222",
    },
  ],
  TRI: [
    {
      name: "Trincomalee Police Station",
      code: "TRI-HQ",
      station_type: "DISTRICT",
      address: "Trincomalee",
      phone: "+94262222222",
    },
  ],
  // North Western Province - 2 districts
  KUR: [
    {
      name: "Kurunegala Police Station",
      code: "KUR-HQ",
      station_type: "PROVINCIAL",
      address: "Kurunegala Town",
      phone: "+94372222222",
    },
  ],
  PUT: [
    {
      name: "Puttalam Police Station",
      code: "PUT-HQ",
      station_type: "DISTRICT",
      address: "Puttalam",
      phone: "+94322222222",
    },
  ],
  // North Central Province - 2 districts
  ANU: [
    {
      name: "Anuradhapura Police Station",
      code: "ANU-HQ",
      station_type: "PROVINCIAL",
      address: "Anuradhapura Town",
      phone: "+94252222222",
    },
  ],
  POL: [
    {
      name: "Polonnaruwa Police Station",
      code: "POL-HQ",
      station_type: "DISTRICT",
      address: "Polonnaruwa",
      phone: "+94272222222",
    },
  ],
  // Uva Province - 2 districts
  BAD: [
    {
      name: "Badulla Police Station",
      code: "BAD-HQ",
      station_type: "DISTRICT",
      address: "Badulla",
      phone: "+94552222222",
    },
  ],
  MON: [
    {
      name: "Monaragala Police Station",
      code: "MON-HQ",
      station_type: "DISTRICT",
      address: "Monaragala",
      phone: "+94552222223",
    },
  ],
  // Sabaragamuwa Province - 2 districts
  RAT: [
    {
      name: "Ratnapura Police Station",
      code: "RAT-HQ",
      station_type: "DISTRICT",
      address: "Ratnapura",
      phone: "+94452222222",
    },
  ],
  KEG: [
    {
      name: "Kegalle Police Station",
      code: "KEG-HQ",
      station_type: "DISTRICT",
      address: "Kegalle",
      phone: "+94352222222",
    },
  ],
};

// Helper: Generate random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Generate Sri Lankan NIC (realistic)
const generateNic = (index) => {
  const random = Math.floor(Math.random() * 1000000000);
  const suffix = Math.random() > 0.5 ? "V" : "X";
  return `${random.toString().padStart(9, "0")}${suffix}`;
};

// Helper: Generate Sri Lankan phone number
const generatePhone = () => {
  const prefixes = ["077", "071", "075", "078", "076", "072", "070"];
  return `${randomItem(prefixes)}${Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0")}`;
};

// Helper: Generate realistic address
const generateAddress = (districtName, driverIndex) => {
  const streets = [
    "Main Street",
    "Galle Road",
    "Kandy Road",
    "Colombo Road",
    "Station Road",
    "Temple Road",
    "Lake Road",
    "Hospital Road",
  ];
  const cities = {
    Colombo: [
      "Colombo 01",
      "Colombo 02",
      "Colombo 03",
      "Colombo 04",
      "Colombo 05",
      "Colombo 06",
      "Colombo 07",
      "Colombo 08",
      "Colombo 09",
      "Colombo 10",
      "Colombo 11",
      "Colombo 12",
      "Colombo 13",
      "Colombo 14",
      "Colombo 15",
    ],
    Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Kadugannawa"],
    Galle: ["Galle", "Unawatuna", "Hikkaduwa", "Ambalangoda"],
    Jaffna: ["Jaffna", "Nallur", "Chunnakam", "Point Pedro"],
    Kurunegala: ["Kurunegala", "Malkaduwawa", "Ibbagamuwa"],
    Anuradhapura: ["Anuradhapura", "Mihintale", "Kekirawa"],
    Badulla: ["Badulla", "Bandarawela", "Haputale", "Ella"],
    Ratnapura: ["Ratnapura", "Embilipitiya", "Balangoda", "Kegalle"],
    Gampaha: [
      "Gampaha",
      "Negombo",
      "Katunayake",
      "Ja-Ela",
      "Wattala",
      "Kandana",
    ],
    Kalutara: ["Kalutara", "Panadura", "Beruwala", "Aluthgama", "Mathugama"],
    Matale: ["Matale", "Dambulla", "Sigiriya", "Palapathwela"],
    "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Maskeliya"],
    Matara: ["Matara", "Weligama", "Mirissa", "Devinuwara"],
    Hambantota: ["Hambantota", "Tangalle", "Ambalantota", "Tissamaharama"],
    Trincomalee: ["Trincomalee", "Nilaveli", "Kinniya", "Muttur"],
    Batticaloa: ["Batticaloa", "Kalkudah", "Passekudah", "Valaichenai"],
    Ampara: ["Ampara", "Kalmunai", "Akkaraipattu", "Nintavur"],
    Puttalam: ["Puttalam", "Chilaw", "Wennappuwa", "Marawila"],
    Polonnaruwa: ["Polonnaruwa", "Kaduruwela", "Giritale"],
    Monaragala: ["Monaragala", "Bibile", "Wellawaya", "Siyambalanduwa"],
    Kegalle: ["Kegalle", "Mawanella", "Warakapola", "Yatiyantota"],
  };
  const cityList = cities[districtName] || [districtName];
  const street = randomItem(streets);
  const city = randomItem(cityList);
  return `No ${driverIndex}, ${street}, ${city}`;
};

// Realistic movement patterns
const getSpeedForHour = (hour, isWeekend) => {
  const weekendFactor = isWeekend ? 0.6 : 1.0;
  let baseSpeed = 0;
  if (hour >= 23 || hour < 5) {
    baseSpeed = 0;
  } else if (hour >= 7 && hour <= 9) {
    baseSpeed = 25 + Math.random() * 25;
  } else if (hour >= 17 && hour <= 19) {
    baseSpeed = 20 + Math.random() * 30;
  } else if (hour >= 11 && hour <= 14) {
    baseSpeed = 15 + Math.random() * 20;
  } else if (hour >= 5 && hour < 7) {
    baseSpeed = 5 + Math.random() * 15;
  } else {
    baseSpeed = 10 + Math.random() * 25;
  }
  return parseFloat((baseSpeed * weekendFactor).toFixed(2));
};

const getMovementDistance = (speedKmh) => (speedKmh / 111) * (5 / 60);

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Starting database seeding...");

    // ==================== PROVINCES ====================
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

    // ==================== DISTRICTS ====================
    logger.info("Seeding districts...");
    const districtMap = {};
    for (const [provinceCode, districts] of Object.entries(
      DISTRICTS_BY_PROVINCE,
    )) {
      for (const d of districts) {
        const [district] = await District.findOrCreate({
          where: { code: d.code },
          defaults: {
            ...d,
            province_id: provinceMap[provinceCode].id,
            latitude: DISTRICT_CITIES[d.name]?.lat || d.latitude,
            longitude: DISTRICT_CITIES[d.name]?.lng || d.longitude,
          },
        });
        districtMap[d.code] = district;
      }
    }
    logger.info(`✅ ${Object.keys(districtMap).length} districts seeded`);

    // ==================== POLICE STATIONS ====================
    logger.info("Seeding police stations for all 25 districts...");
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

    // Create a map of district ID to list of station IDs
    const districtToStationsMap = {};
    for (const station of Object.values(stationMap)) {
      const districtId = station.district_id;
      if (!districtToStationsMap[districtId]) {
        districtToStationsMap[districtId] = [];
      }
      districtToStationsMap[districtId].push(station);
    }
    logger.info(
      `✅ Station jurisdiction map created for ${Object.keys(districtToStationsMap).length} districts`,
    );

    // ==================== USERS ====================
    logger.info("Seeding admin users...");
    await User.findOrCreate({
      where: { username: "hq_admin" },
      defaults: {
        username: "hq_admin",
        email: "hq@police.gov.lk",
        password_hash: "Admin@1234",
        full_name: "Headquarters Administrator",
        role: "SUPER_ADMIN",
        badge_number: "POL-HQ-001",
      },
    });
    await User.findOrCreate({
      where: { username: "wp_admin" },
      defaults: {
        username: "wp_admin",
        email: "wp@police.gov.lk",
        password_hash: "WPAdmin@1234",
        full_name: "Western Province Administrator",
        role: "PROVINCIAL_ADMIN",
        province_id: provinceMap["WP"].id,
        badge_number: "POL-WP-001",
      },
    });
    await User.findOrCreate({
      where: { username: "col_officer" },
      defaults: {
        username: "col_officer",
        email: "colombo@police.gov.lk",
        password_hash: "Officer@1234",
        full_name: "Colombo District Officer",
        role: "STATION_OFFICER",
        province_id: provinceMap["WP"].id,
        district_id: districtMap["COL"].id,
        station_id: stationMap["COL-FORT"]?.id,
        badge_number: "POL-COL-001",
      },
    });
    logger.info("✅ Users seeded");

    // ==================== DRIVERS (200) ====================
    logger.info("Seeding 200 drivers...");
    const drivers = [];
    for (let i = 1; i <= 200; i++) {
      const firstName = randomItem(DRIVER_FIRST_NAMES);
      const lastName = randomItem(DRIVER_LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;
      const nicNumber = generateNic(i);
      const licenseNumber = `LIC-${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0")}`;
      const phone = generatePhone();
      const districtCodes = Object.keys(districtMap);
      const driverDistrictCode = districtCodes[i % districtCodes.length];
      const driverDistrict = districtMap[driverDistrictCode];
      const address = generateAddress(driverDistrict?.name || "Colombo", i);
      const [driver] = await Driver.findOrCreate({
        where: { nic_number: nicNumber },
        defaults: {
          full_name: fullName,
          nic_number: nicNumber,
          license_number: licenseNumber,
          phone: phone,
          address: address,
          date_of_birth: new Date(
            1970 + Math.random() * 30,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28),
          ),
          is_active: true,
        },
      });
      drivers.push(driver);
    }
    logger.info("✅ 200 drivers seeded");

    // ==================== VEHICLES (200 with jurisdiction stations) ====================
    logger.info("Seeding 200 vehicles with jurisdiction stations...");
    const vehicles = [];
    const provinceCodes = Object.keys(provinceMap);

    for (let i = 1; i <= 200; i++) {
      const province = provinceMap[provinceCodes[i % provinceCodes.length]];
      const districtsList = DISTRICTS_BY_PROVINCE[province.code];
      const districtCode = districtsList[i % districtsList.length].code;
      const district = districtMap[districtCode];
      if (!province || !district) continue;

      const regNumber = `${province.code}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const chassisNumber = `CH${province.code}${Math.floor(Math.random() * 90000000 + 10000000)}`;
      const imei = `35${Math.floor(Math.random() * 1000000000000000)
        .toString()
        .padStart(13, "0")}`;
      const make = randomItem(VEHICLE_MAKES);
      const model = randomItem(VEHICLE_MODELS);
      const year = randomItem(VEHICLE_YEARS);

      // Assign a random police station from the vehicle's district
      let jurisdictionStationId = null;
      const stationsInDistrict = districtToStationsMap[district.id];
      if (stationsInDistrict && stationsInDistrict.length > 0) {
        jurisdictionStationId = randomItem(stationsInDistrict).id;
      }

      const [vehicle] = await Vehicle.findOrCreate({
        where: { registration_number: regNumber },
        defaults: {
          registration_number: regNumber,
          chassis_number: chassisNumber,
          driver_id: drivers[i - 1].id,
          province_id: province.id,
          district_id: district.id,
          jurisdiction_station_id: jurisdictionStationId,
          device_imei: imei,
          status: "ACTIVE",
          make: make,
          model: model,
          year: year,
        },
      });

      await User.findOrCreate({
        where: { username: `device_${imei.slice(-10)}` },
        defaults: {
          username: `device_${imei.slice(-10)}`,
          email: `${vehicle.registration_number.toLowerCase()}@tracker.lk`,
          password_hash: `Device@${imei.slice(-8)}`,
          full_name: `${make} ${model} - ${vehicle.registration_number}`,
          role: "DEVICE_CLIENT",
          province_id: province.id,
          district_id: district.id,
        },
      });
      vehicles.push({ vehicle, province, district });
    }
    logger.info(`✅ ${vehicles.length} vehicles seeded`);

    // Count vehicles with jurisdiction assigned
    const vehiclesWithJurisdiction = await Vehicle.count({
      where: {
        jurisdiction_station_id: { [require("sequelize").Op.ne]: null },
      },
    });
    logger.info(
      `✅ ${vehiclesWithJurisdiction} out of ${vehicles.length} vehicles have jurisdiction_station_id assigned`,
    );

    // ==================== LOCATION PINGS (7 days) ====================
    logger.info("Seeding 7 days of location history...");
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pingIntervalMinutes = 5;
    const pingIntervalMs = pingIntervalMinutes * 60 * 1000;
    let totalPings = 0;
    let pingBatch = [];

    for (const { vehicle, province, district } of vehicles) {
      let currentLat = district.latitude || 6.9;
      let currentLng = district.longitude || 79.8;
      const homeLat = currentLat;
      const homeLng = currentLng;
      let currentTime = new Date(oneWeekAgo);

      while (currentTime <= now) {
        const hour = currentTime.getHours();
        const isWeekend =
          currentTime.getDay() === 0 || currentTime.getDay() === 6;
        const speed = getSpeedForHour(hour, isWeekend);
        const movementDistance = getMovementDistance(speed);

        if (speed === 0) {
          currentLat = homeLat + (Math.random() - 0.5) * 0.0005;
          currentLng = homeLng + (Math.random() - 0.5) * 0.0005;
        } else {
          const angle = Math.random() * Math.PI * 2;
          currentLat += Math.cos(angle) * movementDistance;
          currentLng += Math.sin(angle) * movementDistance;
        }

        currentLat = Math.max(5.5, Math.min(10.5, currentLat));
        currentLng = Math.max(79.0, Math.min(82.5, currentLng));

        pingBatch.push({
          vehicle_id: vehicle.id,
          latitude: parseFloat(currentLat.toFixed(8)),
          longitude: parseFloat(currentLng.toFixed(8)),
          speed: speed,
          heading: parseFloat((Math.random() * 360).toFixed(2)),
          accuracy: parseFloat((3 + Math.random() * 10).toFixed(2)),
          timestamp: new Date(currentTime),
          province_id: province.id,
          district_id: district.id,
          created_at: new Date(currentTime),
        });

        totalPings++;
        currentTime = new Date(currentTime.getTime() + pingIntervalMs);

        if (pingBatch.length >= 5000) {
          await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
          pingBatch = [];
          logger.info(`   Inserted ${totalPings} pings so far...`);
        }
      }
    }

    if (pingBatch.length > 0) {
      await LocationPing.bulkCreate(pingBatch, { ignoreDuplicates: true });
    }

    logger.info(`✅ ${totalPings} location pings seeded`);

    // Display sample vehicles with jurisdiction
    const sampleVehicles = await Vehicle.findAll({
      where: {
        jurisdiction_station_id: { [require("sequelize").Op.ne]: null },
      },
      limit: 5,
      include: [
        {
          model: PoliceStation,
          as: "jurisdiction_station",
          attributes: ["name", "code"],
        },
        { model: District, as: "district", attributes: ["name"] },
      ],
    });

    logger.info("\n📋 Sample Vehicles with Jurisdiction Stations:");
    sampleVehicles.forEach((v) => {
      logger.info(
        `   ${v.registration_number} → ${v.jurisdiction_station?.name || "No station"} (${v.district?.name})`,
      );
    });

    logger.info("\n🎉 Database seeding complete!");
    logger.info("\n📋 Test Login Credentials:");
    logger.info("   SUPER_ADMIN: username=hq_admin, password=Admin@1234");
    logger.info(
      "   PROVINCIAL_ADMIN: username=wp_admin, password=WPAdmin@1234",
    );
    logger.info(
      "   STATION_OFFICER: username=col_officer, password=Officer@1234",
    );

    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();

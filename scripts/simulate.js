require("dotenv").config();
const { sequelize } = require("../src/config/database");
const { Vehicle, LocationPing } = require("../src/models");
const logger = require("../src/utils/logger");

// ============================================================
// Real-time GPS Ping Simulator
// Run this during your VIVA to show live tuk-tuk movement
// It sends a ping for every active vehicle every 10 seconds
// ============================================================

const simulateRealtime = async () => {
  await sequelize.authenticate();
  logger.info("🚗 Starting real-time simulation...");
  logger.info("Press Ctrl+C to stop.\n");

  // Get all active vehicles
  const vehicles = await Vehicle.findAll({
    where: { status: "ACTIVE" },
    limit: 50, // Simulate 50 vehicles at a time for demo
  });

  if (!vehicles.length) {
    logger.error("No active vehicles found. Run npm run seed first.");
    process.exit(1);
  }

  logger.info(
    `Simulating ${vehicles.length} vehicles. Pinging every 10 seconds...`,
  );

  // Store current positions for each vehicle
  const positions = {};
  vehicles.forEach((v) => {
    positions[v.id] = {
      lat: 6.0 + Math.random() * 3.5,
      lng: 79.8 + Math.random() * 2.0,
    };
  });

  let pingCount = 0;

  const pingLoop = async () => {
    const batch = [];
    const now = new Date();
    const hour = now.getHours();

    // Night time: reduce activity
    const isActive = !(hour >= 23 || hour < 5);

    for (const vehicle of vehicles) {
      const pos = positions[vehicle.id];

      // Move the vehicle
      if (isActive) {
        pos.lat += (Math.random() - 0.5) * 0.003;
        pos.lng += (Math.random() - 0.5) * 0.003;
        pos.lat = Math.max(5.9, Math.min(9.9, pos.lat));
        pos.lng = Math.max(79.6, Math.min(81.9, pos.lng));
      }

      batch.push({
        vehicle_id: vehicle.id,
        latitude: parseFloat(pos.lat.toFixed(8)),
        longitude: parseFloat(pos.lng.toFixed(8)),
        speed: isActive ? parseFloat((Math.random() * 60).toFixed(2)) : 0,
        heading: parseFloat((Math.random() * 360).toFixed(2)),
        accuracy: parseFloat((3 + Math.random() * 5).toFixed(2)),
        timestamp: now,
        province_id: vehicle.province_id,
        district_id: vehicle.district_id,
        created_at: now,
      });
    }

    await LocationPing.bulkCreate(batch, { ignoreDuplicates: true });
    pingCount += batch.length;

    logger.info(
      `✅ Ping #${Math.ceil(pingCount / vehicles.length)}: ${batch.length} vehicles updated at ${now.toISOString()}`,
    );
  };

  // Run first ping immediately
  await pingLoop();

  // Then every 10 seconds
  const interval = setInterval(async () => {
    try {
      await pingLoop();
    } catch (err) {
      logger.error("Simulation error:", err.message);
    }
  }, 10000);

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(interval);
    logger.info(`\n🏁 Simulation stopped. Total pings sent: ${pingCount}`);
    process.exit(0);
  });
};

simulateRealtime().catch((err) => {
  logger.error("Failed to start simulation:", err);
  process.exit(1);
});

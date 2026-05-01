// const request = require("supertest");
// const app = require("../src/app");

// let adminToken;
// let officerToken;
// let createdDriverId;

// beforeAll(async () => {
//   const adminLogin = await request(app)
//     .post("/api/v1/auth/login")
//     .send({ username: "hq_admin", password: "Admin@1234" });
//   adminToken = adminLogin.body.data?.accessToken;

//   const officerLogin = await request(app)
//     .post("/api/v1/auth/login")
//     .send({ username: "col_officer", password: "Officer@1234" });
//   officerToken = officerLogin.body.data?.accessToken;
// });

// describe("Driver API", () => {
//   // ─── GET /drivers ─────────────────────────────────────────────────────────
//   describe("GET /api/v1/drivers", () => {
//     it("should return 200 and paginated drivers for admin", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(Array.isArray(res.body.data)).toBe(true);
//       expect(res.body.meta).toHaveProperty("totalItems");
//     });

//     it("should return 401 without auth", async () => {
//       const res = await request(app).get("/api/v1/drivers");
//       expect(res.status).toBe(401);
//     });

//     it("should filter drivers by is_active=true", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers?is_active=true")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       res.body.data.forEach((d) => {
//         expect(d.is_active).toBe(true);
//       });
//     });

//     it("should search drivers by name", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers?search=Driver 1")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(Array.isArray(res.body.data)).toBe(true);
//     });

//     it("should support pagination", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers?page=1&limit=10")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data.length).toBeLessThanOrEqual(10);
//     });
//   });

//   // ─── POST /drivers ────────────────────────────────────────────────────────
//   describe("POST /api/v1/drivers", () => {
//     it("should create a driver successfully", async () => {
//       const newDriver = {
//         full_name: "Test Driver Kamal",
//         nic_number: "991234567V",
//         license_number: "LIC-TEST-001",
//         phone: "0771234599",
//         address: "123 Test Street, Colombo",
//       };

//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send(newDriver);

//       expect(res.status).toBe(201);
//       expect(res.body.success).toBe(true);
//       expect(res.body.data.full_name).toBe("Test Driver Kamal");
//       expect(res.body.data.nic_number).toBe("991234567V");
//       createdDriverId = res.body.data.id;
//     });

//     it("should return 409 for duplicate NIC number", async () => {
//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({
//           full_name: "Another Driver",
//           nic_number: "991234567V", // Duplicate
//           license_number: "LIC-TEST-002",
//         });

//       expect(res.status).toBe(409);
//     });

//     it("should return 422 for invalid NIC format", async () => {
//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({
//           full_name: "Bad NIC Driver",
//           nic_number: "INVALID-NIC",
//           license_number: "LIC-TEST-003",
//         });

//       expect(res.status).toBe(422);
//     });

//     it("should return 422 for invalid phone number", async () => {
//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({
//           full_name: "Bad Phone Driver",
//           nic_number: "991234568V",
//           license_number: "LIC-TEST-004",
//           phone: "12345", // Invalid Sri Lanka phone
//         });

//       expect(res.status).toBe(422);
//     });

//     it("should return 422 for missing required fields", async () => {
//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ full_name: "Incomplete Driver" }); // Missing NIC and license

//       expect(res.status).toBe(422);
//     });

//     it("should return 403 for non-SUPER_ADMIN creating driver", async () => {
//       const res = await request(app)
//         .post("/api/v1/drivers")
//         .set("Authorization", `Bearer ${officerToken}`)
//         .send({
//           full_name: "Unauthorized Driver",
//           nic_number: "881234567V",
//           license_number: "LIC-UNAUTH-001",
//         });

//       expect(res.status).toBe(403);
//     });
//   });

//   // ─── GET /drivers/:id ─────────────────────────────────────────────────────
//   describe("GET /api/v1/drivers/:id", () => {
//     it("should return driver with vehicle info", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data).toHaveProperty("full_name");
//       expect(res.body.data).toHaveProperty("nic_number");
//       expect(res.body.data).toHaveProperty("license_number");
//     });

//     it("should return 304 on second request (ETag caching)", async () => {
//       // First request to get ETag
//       const first = await request(app)
//         .get("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${adminToken}`);

//       const etag = first.headers["etag"];
//       expect(etag).toBeDefined();

//       // Second request with If-None-Match
//       const second = await request(app)
//         .get("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .set("If-None-Match", etag);

//       expect(second.status).toBe(304);
//     });

//     it("should return 404 for non-existent driver", async () => {
//       const res = await request(app)
//         .get("/api/v1/drivers/999999")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(404);
//     });
//   });

//   // ─── PUT /drivers/:id ─────────────────────────────────────────────────────
//   describe("PUT /api/v1/drivers/:id", () => {
//     it("should update driver phone number", async () => {
//       if (!createdDriverId) return;

//       const res = await request(app)
//         .put(`/api/v1/drivers/${createdDriverId}`)
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ phone: "0769876543" });

//       expect(res.status).toBe(200);
//       expect(res.body.data.phone).toBe("0769876543");
//     });

//     it("should return 422 with empty update body", async () => {
//       const res = await request(app)
//         .put("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({});

//       expect(res.status).toBe(422);
//     });

//     it("should return 422 for invalid phone in update", async () => {
//       const res = await request(app)
//         .put("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ phone: "bad-phone" });

//       expect(res.status).toBe(422);
//     });
//   });

//   // ─── DELETE /drivers/:id ──────────────────────────────────────────────────
//   describe("DELETE /api/v1/drivers/:id", () => {
//     it("should deactivate a driver with no active vehicle", async () => {
//       if (!createdDriverId) return;

//       const res = await request(app)
//         .delete(`/api/v1/drivers/${createdDriverId}`)
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//     });

//     it("should return 403 for non-SUPER_ADMIN attempting delete", async () => {
//       const res = await request(app)
//         .delete("/api/v1/drivers/1")
//         .set("Authorization", `Bearer ${officerToken}`);

//       expect(res.status).toBe(403);
//     });

//     it("should return 404 for non-existent driver", async () => {
//       const res = await request(app)
//         .delete("/api/v1/drivers/999999")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(404);
//     });
//   });
// });

const request = require("supertest");
const app = require("../src/app");

let adminToken;
let wpToken;
let officerToken;
let deviceToken;

beforeAll(async () => {
  const [adminLogin, wpLogin, officerLogin, deviceLogin] = await Promise.all([
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "hq_admin", password: "Admin@1234" }),
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "wp_admin", password: "WPAdmin@1234" }),
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "col_officer", password: "Officer@1234" }),
    request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "device_352148078300001",
        password: "Device@352148078300001",
      }),
  ]);
  adminToken = adminLogin.body.data?.accessToken;
  wpToken = wpLogin.body.data?.accessToken;
  officerToken = officerLogin.body.data?.accessToken;
  deviceToken = deviceLogin.body.data?.accessToken;
});

describe("Location API", () => {
  // ─── GPS PING ─────────────────────────────────────────────────────────────
  describe("POST /api/v1/locations/ping", () => {
    it("should accept ping from DEVICE_CLIENT — 201 with server timestamp", async () => {
      const before = new Date();
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 6.9271,
          longitude: 79.8612,
          speed: 35.5,
          heading: 270,
          accuracy: 5.0,
          // NO timestamp — server should use current time
        });
      const after = new Date();

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("ping_id");
      expect(res.body.data).toHaveProperty("vehicle_id");
      // Confirm timestamp is near current time
      const pingTime = new Date(res.body.data.timestamp);
      expect(pingTime.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 5000,
      );
      expect(pingTime.getTime()).toBeLessThanOrEqual(after.getTime() + 5000);
    });

    it("should accept ping from SUPER_ADMIN (admin can also ping)", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 6.9271,
          longitude: 79.8612,
          speed: 0,
          heading: 0,
        });
      expect(res.status).toBe(201);
    });

    it("should accept ping with minimum required fields only", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 7.2906,
          longitude: 80.6337,
        });
      expect(res.status).toBe(201);
    });

    it("should return 422 for latitude below Sri Lanka bounds (< 5.5)", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 4.0,
          longitude: 79.8612,
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for latitude above Sri Lanka bounds (> 10.5)", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 15.0,
          longitude: 79.8612,
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for longitude out of bounds", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 6.9271,
          longitude: 50.0,
        });
      expect(res.status).toBe(422);
    });

    it("should return 404 for unregistered IMEI", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          device_imei: "999999999999999",
          latitude: 6.9271,
          longitude: 79.8612,
        });
      expect(res.status).toBe(404);
    });

    it("should return 403 for STATION_OFFICER submitting ping", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          device_imei: "352148078300001",
          latitude: 6.9271,
          longitude: 79.8612,
        });
      expect(res.status).toBe(403);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).post("/api/v1/locations/ping").send({
        device_imei: "352148078300001",
        latitude: 6.9271,
        longitude: 79.8612,
      });
      expect(res.status).toBe(401);
    });

    it("should return 422 for IMEI not exactly 15 digits", async () => {
      const res = await request(app)
        .post("/api/v1/locations/ping")
        .set("Authorization", `Bearer ${deviceToken}`)
        .send({
          device_imei: "12345678",
          latitude: 6.9271,
          longitude: 79.8612,
        });
      expect(res.status).toBe(422);
    });
  });

  // ─── LIVE VIEW ────────────────────────────────────────────────────────────
  describe("GET /api/v1/locations/live", () => {
    it("should return 200 with success=true for SUPER_ADMIN", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });

    it("should return 200 for PROVINCIAL_ADMIN (scoped to province)", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live")
        .set("Authorization", `Bearer ${wpToken}`);
      expect(res.status).toBe(200);
    });

    it("should return 200 for STATION_OFFICER (scoped to district)", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.status).toBe(200);
    });

    it("should accept province_id filter", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live?province_id=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should accept district_id filter", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live?district_id=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/v1/locations/live");
      expect(res.status).toBe(401);
    });

    it("should return 403 for DEVICE_CLIENT", async () => {
      const res = await request(app)
        .get("/api/v1/locations/live")
        .set("Authorization", `Bearer ${deviceToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── SINGLE VEHICLE LIVE ──────────────────────────────────────────────────
  describe("GET /api/v1/locations/:vehicleId/live", () => {
    it("should return latest location for vehicle 1", async () => {
      const res = await request(app)
        .get("/api/v1/locations/1/live")
        .set("Authorization", `Bearer ${adminToken}`);
      expect([200, 404]).toContain(res.status);
    });

    it("should return 404 for non-existent vehicle", async () => {
      const res = await request(app)
        .get("/api/v1/locations/999999/live")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/v1/locations/1/live");
      expect(res.status).toBe(401);
    });
  });

  // ─── HISTORY ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/locations/:vehicleId/history", () => {
    it("should return history with 7-day window and correct structure", async () => {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .query({ from, to })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toHaveProperty("totalItems");
    });

    it("should return pings in chronological order (ASC)", async () => {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .query({ from, limit: 20 })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 1) {
        const times = res.body.data.map((p) => new Date(p.timestamp).getTime());
        for (let i = 1; i < times.length; i++) {
          expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
        }
      }
    });

    it("should verify simulation patterns — night pings have speed=0", async () => {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .query({ from, to, limit: 1000 })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const nightPings = res.body.data.filter((p) => {
        const h = new Date(p.timestamp).getHours();
        return h >= 23 || h < 5;
      });
      // Night pings should have speed=0
      nightPings.forEach((p) => {
        expect(parseFloat(p.speed)).toBe(0);
      });
    });

    it("should paginate history correctly", async () => {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .query({ from, page: 1, limit: 5 })
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should return 422 without required from parameter", async () => {
      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(422);
    });

    it("should return 404 for non-existent vehicle", async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .get("/api/v1/locations/999999/history")
        .query({ from })
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it("should return 401 without token", async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .get("/api/v1/locations/1/history")
        .query({ from });
      expect(res.status).toBe(401);
    });
  });
});

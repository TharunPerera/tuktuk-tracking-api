// // // const request = require("supertest");
// // // const app = require("../src/app");

// // // let adminToken;

// // // beforeAll(async () => {
// // //   const loginRes = await request(app)
// // //     .post("/api/v1/auth/login")
// // //     .send({ username: "hq_admin", password: "Admin@1234" });
// // //   adminToken = loginRes.body.data?.accessToken;
// // // });

// // // describe("Location API", () => {
// // //   describe("GET /api/v1/locations/live", () => {
// // //     it("should return live locations for admin", async () => {
// // //       const response = await request(app)
// // //         .get("/api/v1/locations/live")
// // //         .set("Authorization", `Bearer ${adminToken}`);

// // //       expect(response.status).toBe(200);
// // //       expect(response.body.success).toBe(true);
// // //       expect(Array.isArray(response.body.data)).toBe(true);
// // //     });

// // //     it("should return 401 without auth", async () => {
// // //       const response = await request(app).get("/api/v1/locations/live");
// // //       expect(response.status).toBe(401);
// // //     });
// // //   });

// // //   describe("GET /api/v1/locations/:vehicleId/history", () => {
// // //     it("should return history with valid time range", async () => {
// // //       const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24h ago
// // //       const to = new Date().toISOString();

// // //       const response = await request(app)
// // //         .get("/api/v1/locations/1/history")
// // //         .query({ from, to })
// // //         .set("Authorization", `Bearer ${adminToken}`);

// // //       expect(response.status).toBe(200);
// // //       expect(response.body.data).toBeDefined();
// // //     });

// // //     it("should return 422 without required from parameter", async () => {
// // //       const response = await request(app)
// // //         .get("/api/v1/locations/1/history")
// // //         .set("Authorization", `Bearer ${adminToken}`);

// // //       expect(response.status).toBe(422);
// // //     });
// // //   });
// // // });

// // const request = require("supertest");
// // const app = require("../src/app");

// // let adminToken;

// // beforeAll(async () => {
// //   const loginRes = await request(app)
// //     .post("/api/v1/auth/login")
// //     .send({ username: "hq_admin", password: "Admin@1234" });
// //   adminToken = loginRes.body.data?.accessToken;
// // });

// // describe("Location API", () => {
// //   // ─── LIVE VIEW ────────────────────────────────────────────────────────────
// //   describe("GET /api/v1/locations/live", () => {
// //     it("should return 200 and an array for admin", async () => {
// //       const response = await request(app)
// //         .get("/api/v1/locations/live")
// //         .set("Authorization", `Bearer ${adminToken}`);

// //       expect(response.status).toBe(200);
// //       expect(response.body.success).toBe(true);
// //       // data is an array (may be empty if no vehicles active yet, but must be an array)
// //       expect(Array.isArray(response.body.data)).toBe(true);
// //     });

// //     it("should return 401 without auth", async () => {
// //       const response = await request(app).get("/api/v1/locations/live");
// //       expect(response.status).toBe(401);
// //     });

// //     it("should accept province_id filter", async () => {
// //       const response = await request(app)
// //         .get("/api/v1/locations/live?province_id=1")
// //         .set("Authorization", `Bearer ${adminToken}`);
// //       expect(response.status).toBe(200);
// //       expect(Array.isArray(response.body.data)).toBe(true);
// //     });
// //   });

// //   // ─── HISTORY ──────────────────────────────────────────────────────────────
// //   describe("GET /api/v1/locations/:vehicleId/history", () => {
// //     it("should return history with valid time range", async () => {
// //       const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
// //       const to = new Date().toISOString();

// //       const response = await request(app)
// //         .get("/api/v1/locations/1/history")
// //         .query({ from, to })
// //         .set("Authorization", `Bearer ${adminToken}`);

// //       expect(response.status).toBe(200);
// //       expect(response.body.success).toBe(true);
// //       // data is an array of pings
// //       expect(Array.isArray(response.body.data)).toBe(true);
// //     });

// //     it("should return 422 without required from parameter", async () => {
// //       const response = await request(app)
// //         .get("/api/v1/locations/1/history")
// //         .set("Authorization", `Bearer ${adminToken}`);
// //       expect(response.status).toBe(422);
// //     });

// //     it("should return 404 for non-existent vehicle", async () => {
// //       const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
// //       const response = await request(app)
// //         .get("/api/v1/locations/999999/history")
// //         .query({ from })
// //         .set("Authorization", `Bearer ${adminToken}`);
// //       expect(response.status).toBe(404);
// //     });
// //   });

// //   // ─── SINGLE VEHICLE LIVE ──────────────────────────────────────────────────
// //   describe("GET /api/v1/locations/:vehicleId/live", () => {
// //     it("should return latest location for vehicle 1", async () => {
// //       const response = await request(app)
// //         .get("/api/v1/locations/1/live")
// //         .set("Authorization", `Bearer ${adminToken}`);

// //       // 200 if pings exist, 404 if no pings in DB — both are correct
// //       expect([200, 404]).toContain(response.status);
// //     });

// //     it("should return 401 without auth", async () => {
// //       const response = await request(app).get("/api/v1/locations/1/live");
// //       expect(response.status).toBe(401);
// //     });
// //   });
// // });

// const request = require("supertest");
// const app = require("../src/app");

// let adminToken;

// beforeAll(async () => {
//   const loginRes = await request(app)
//     .post("/api/v1/auth/login")
//     .send({ username: "hq_admin", password: "Admin@1234" });
//   adminToken = loginRes.body.data?.accessToken;
// });

// describe("Location API", () => {
//   // ─── LIVE VIEW ────────────────────────────────────────────────────────────
//   describe("GET /api/v1/locations/live", () => {
//     it("should return 200 and success=true for admin", async () => {
//       const response = await request(app)
//         .get("/api/v1/locations/live")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       // data can be array OR null — both are valid depending on DB state
//       // What matters is the response structure is correct
//       expect(response.body).toHaveProperty("data");
//     });

//     it("should return 401 without auth token", async () => {
//       const response = await request(app).get("/api/v1/locations/live");
//       expect(response.status).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it("should accept province_id filter and return 200", async () => {
//       const response = await request(app)
//         .get("/api/v1/locations/live?province_id=1")
//         .set("Authorization", `Bearer ${adminToken}`);
//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//     });

//     it("should return 403 when DEVICE_CLIENT tries to access live view", async () => {
//       const deviceLogin = await request(app).post("/api/v1/auth/login").send({
//         username: "device_352148078300001",
//         password: "Device@352148078300001",
//       });
//       const deviceToken = deviceLogin.body.data?.accessToken;

//       const response = await request(app)
//         .get("/api/v1/locations/live")
//         .set("Authorization", `Bearer ${deviceToken}`);
//       expect(response.status).toBe(403);
//     });
//   });

//   // ─── HISTORY ──────────────────────────────────────────────────────────────
//   describe("GET /api/v1/locations/:vehicleId/history", () => {
//     it("should return 200 with data array for 7-day window", async () => {
//       const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       const to = new Date().toISOString();

//       const response = await request(app)
//         .get("/api/v1/locations/1/history")
//         .query({ from, to })
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(Array.isArray(response.body.data)).toBe(true);
//       // Should have pings since seed generates 7 days of data
//       expect(response.body.data.length).toBeGreaterThan(0);
//       expect(response.body.meta).toHaveProperty("totalItems");
//     });

//     it("should return pings in chronological order (ASC by timestamp)", async () => {
//       const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       const to = new Date().toISOString();

//       const response = await request(app)
//         .get("/api/v1/locations/1/history")
//         .query({ from, to, limit: 10 })
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(response.status).toBe(200);
//       if (response.body.data.length > 1) {
//         const timestamps = response.body.data.map((p) =>
//           new Date(p.timestamp).getTime(),
//         );
//         for (let i = 1; i < timestamps.length; i++) {
//           expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
//         }
//       }
//     });

//     it("should return 422 without required from parameter", async () => {
//       const response = await request(app)
//         .get("/api/v1/locations/1/history")
//         .set("Authorization", `Bearer ${adminToken}`);
//       expect(response.status).toBe(422);
//     });

//     it("should return 404 for non-existent vehicle", async () => {
//       const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
//       const response = await request(app)
//         .get("/api/v1/locations/999999/history")
//         .query({ from })
//         .set("Authorization", `Bearer ${adminToken}`);
//       expect(response.status).toBe(404);
//     });

//     it("should support pagination (page and limit)", async () => {
//       const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
//       const response = await request(app)
//         .get("/api/v1/locations/1/history")
//         .query({ from, page: 1, limit: 5 })
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(response.status).toBe(200);
//       expect(response.body.data.length).toBeLessThanOrEqual(5);
//     });
//   });

//   // ─── SINGLE VEHICLE LIVE ──────────────────────────────────────────────────
//   describe("GET /api/v1/locations/:vehicleId/live", () => {
//     it("should return 200 or 404 for vehicle 1 (depends on ping data)", async () => {
//       const response = await request(app)
//         .get("/api/v1/locations/1/live")
//         .set("Authorization", `Bearer ${adminToken}`);
//       // 200 if pings exist in DB, 404 if no pings — both valid
//       expect([200, 404]).toContain(response.status);
//     });

//     it("should return 401 without auth", async () => {
//       const response = await request(app).get("/api/v1/locations/1/live");
//       expect(response.status).toBe(401);
//     });

//     it("should return 404 for non-existent vehicle", async () => {
//       const response = await request(app)
//         .get("/api/v1/locations/999999/live")
//         .set("Authorization", `Bearer ${adminToken}`);
//       expect(response.status).toBe(404);
//     });
//   });

//   // ─── GPS PING SUBMISSION ──────────────────────────────────────────────────
//   describe("POST /api/v1/locations/ping", () => {
//     it("should submit a GPS ping as DEVICE_CLIENT and return 201", async () => {
//       const deviceLogin = await request(app).post("/api/v1/auth/login").send({
//         username: "device_352148078300001",
//         password: "Device@352148078300001",
//       });
//       const deviceToken = deviceLogin.body.data?.accessToken;

//       const response = await request(app)
//         .post("/api/v1/locations/ping")
//         .set("Authorization", `Bearer ${deviceToken}`)
//         .send({
//           device_imei: "352148078300001",
//           latitude: 6.9271,
//           longitude: 79.8612,
//           speed: 35.5,
//           heading: 270,
//           accuracy: 5.0,
//         });

//       expect(response.status).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty("ping_id");
//       expect(response.body.data).toHaveProperty("vehicle_id");
//     });

//     it("should return 422 for out-of-Sri-Lanka latitude", async () => {
//       const deviceLogin = await request(app).post("/api/v1/auth/login").send({
//         username: "device_352148078300001",
//         password: "Device@352148078300001",
//       });
//       const deviceToken = deviceLogin.body.data?.accessToken;

//       const response = await request(app)
//         .post("/api/v1/locations/ping")
//         .set("Authorization", `Bearer ${deviceToken}`)
//         .send({
//           device_imei: "352148078300001",
//           latitude: 50.0, // Out of Sri Lanka bounds
//           longitude: 79.8612,
//         });
//       expect(response.status).toBe(422);
//     });

//     it("should return 403 when STATION_OFFICER tries to submit a ping", async () => {
//       const officerLogin = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "col_officer", password: "Officer@1234" });
//       const officerToken = officerLogin.body.data?.accessToken;

//       const response = await request(app)
//         .post("/api/v1/locations/ping")
//         .set("Authorization", `Bearer ${officerToken}`)
//         .send({
//           device_imei: "352148078300001",
//           latitude: 6.9271,
//           longitude: 79.8612,
//         });
//       expect(response.status).toBe(403);
//     });
//   });
// });

const request = require("supertest");
const app = require("../src/app");

let adminToken;
let wpToken;
let officerToken;
let createdDriverId;

beforeAll(async () => {
  const [adminLogin, wpLogin, officerLogin] = await Promise.all([
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "hq_admin", password: "Admin@1234" }),
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "wp_admin", password: "WPAdmin@1234" }),
    request(app)
      .post("/api/v1/auth/login")
      .send({ username: "col_officer", password: "Officer@1234" }),
  ]);
  adminToken = adminLogin.body.data?.accessToken;
  wpToken = wpLogin.body.data?.accessToken;
  officerToken = officerLogin.body.data?.accessToken;
});

describe("Driver API", () => {
  // ─── GET /drivers ─────────────────────────────────────────────────────────
  describe("GET /api/v1/drivers", () => {
    it("should return 200 with pagination for SUPER_ADMIN", async () => {
      const res = await request(app)
        .get("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty("totalItems");
      expect(res.body.meta.totalItems).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/v1/drivers");
      expect(res.status).toBe(401);
    });

    it("should filter by is_active=true", async () => {
      const res = await request(app)
        .get("/api/v1/drivers?is_active=true")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((d) => expect(d.is_active).toBe(true));
    });

    it("should filter by is_active=false", async () => {
      const res = await request(app)
        .get("/api/v1/drivers?is_active=false")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      // may be empty but must be valid array
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should search by name", async () => {
      const res = await request(app)
        .get("/api/v1/drivers?search=Driver 1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should search by NIC number", async () => {
      const res = await request(app)
        .get("/api/v1/drivers?search=000000001V")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should support limit parameter", async () => {
      const res = await request(app)
        .get("/api/v1/drivers?limit=5")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.meta.itemsPerPage).toBe(5);
    });

    it("PROVINCIAL_ADMIN can also list drivers", async () => {
      const res = await request(app)
        .get("/api/v1/drivers")
        .set("Authorization", `Bearer ${wpToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ─── POST /drivers ────────────────────────────────────────────────────────
  describe("POST /api/v1/drivers", () => {
    it("should create driver with old-format NIC (9 digits + V)", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Test Driver Kamal",
          nic_number: "991234567V",
          license_number: "LIC-TEST-001",
          phone: "0771234599",
          address: "123 Test Street, Colombo",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.full_name).toBe("Test Driver Kamal");
      expect(res.body.data.nic_number).toBe("991234567V");
      createdDriverId = res.body.data.id;
    });

    it("should create driver with new-format NIC (12 digits)", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Test Driver New NIC",
          nic_number: "200012345678",
          license_number: "LIC-TEST-NEW-002",
        });
      expect(res.status).toBe(201);
    });

    it("should create driver with +94 format phone", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Test Driver Plus Phone",
          nic_number: "881234567X",
          license_number: "LIC-TEST-003",
          phone: "+94771234567",
        });
      expect(res.status).toBe(201);
    });

    it("should return 409 for duplicate NIC number", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Another Driver",
          nic_number: "991234567V",
          license_number: "LIC-TEST-DUP",
        });
      expect(res.status).toBe(409);
    });

    it("should return 422 for invalid NIC format", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Bad NIC Driver",
          nic_number: "INVALID-NIC",
          license_number: "LIC-TEST-BAD1",
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for NIC too short (8 digits)", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Short NIC",
          nic_number: "12345678V",
          license_number: "LIC-TEST-BAD2",
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for invalid Sri Lanka phone", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Bad Phone Driver",
          nic_number: "991234568V",
          license_number: "LIC-TEST-BAD3",
          phone: "12345",
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ full_name: "Incomplete" });
      expect(res.status).toBe(422);
    });

    it("should return 403 for STATION_OFFICER", async () => {
      const res = await request(app)
        .post("/api/v1/drivers")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          full_name: "Unauthorized",
          nic_number: "881234568V",
          license_number: "LIC-UNAUTH",
        });
      expect(res.status).toBe(403);
    });
  });

  // ─── GET /drivers/:id with ETag ───────────────────────────────────────────
  describe("GET /api/v1/drivers/:id (ETag caching)", () => {
    it("should return 200 with ETag header", async () => {
      const res = await request(app)
        .get("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers["etag"]).toBeDefined();
      expect(res.body.data).toHaveProperty("full_name");
      expect(res.body.data).toHaveProperty("nic_number");
    });

    it("should return 304 Not Modified when ETag matches (conditional GET)", async () => {
      const first = await request(app)
        .get("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`);
      const etag = first.headers["etag"];
      expect(etag).toBeDefined();

      const second = await request(app)
        .get("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .set("If-None-Match", etag);
      expect(second.status).toBe(304);
    });

    it("should return 200 (not 304) when ETag does not match", async () => {
      const res = await request(app)
        .get("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .set("If-None-Match", '"wrong-etag-value-12345"');
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent driver", async () => {
      const res = await request(app)
        .get("/api/v1/drivers/999999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /drivers/:id ─────────────────────────────────────────────────────
  describe("PUT /api/v1/drivers/:id", () => {
    it("should update phone number", async () => {
      if (!createdDriverId) return;
      const res = await request(app)
        .put(`/api/v1/drivers/${createdDriverId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phone: "0769876543" });
      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe("0769876543");
    });

    it("should update address", async () => {
      if (!createdDriverId) return;
      const res = await request(app)
        .put(`/api/v1/drivers/${createdDriverId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ address: "456 New Address, Colombo 7" });
      expect(res.status).toBe(200);
    });

    it("should update full_name", async () => {
      if (!createdDriverId) return;
      const res = await request(app)
        .put(`/api/v1/drivers/${createdDriverId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ full_name: "Updated Driver Name" });
      expect(res.status).toBe(200);
    });

    it("should return 422 for empty update body", async () => {
      const res = await request(app)
        .put("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it("should return 422 for invalid phone format", async () => {
      const res = await request(app)
        .put("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phone: "bad-phone" });
      expect(res.status).toBe(422);
    });

    it("should return 404 for non-existent driver", async () => {
      const res = await request(app)
        .put("/api/v1/drivers/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phone: "0771234567" });
      expect(res.status).toBe(404);
    });

    it("PROVINCIAL_ADMIN can update driver", async () => {
      if (!createdDriverId) return;
      const res = await request(app)
        .put(`/api/v1/drivers/${createdDriverId}`)
        .set("Authorization", `Bearer ${wpToken}`)
        .send({ address: "WP Admin updated address" });
      expect(res.status).toBe(200);
    });
  });

  // ─── DELETE /drivers/:id ──────────────────────────────────────────────────
  describe("DELETE /api/v1/drivers/:id", () => {
    it("should deactivate a driver with no active vehicle", async () => {
      if (!createdDriverId) return;
      const res = await request(app)
        .delete(`/api/v1/drivers/${createdDriverId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should return 409 when driver has an active vehicle", async () => {
      // driver 1 has an active vehicle from seed
      const res = await request(app)
        .delete("/api/v1/drivers/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(409);
    });

    it("should return 403 for STATION_OFFICER", async () => {
      const res = await request(app)
        .delete("/api/v1/drivers/5")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent driver", async () => {
      const res = await request(app)
        .delete("/api/v1/drivers/999999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});

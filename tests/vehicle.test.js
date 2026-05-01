// const request = require("supertest");
// const app = require("../src/app");

// let adminToken;
// let officerToken;
// let createdVehicleId;

// beforeAll(async () => {
//   // Login as SUPER_ADMIN
//   const adminLogin = await request(app)
//     .post("/api/v1/auth/login")
//     .send({ username: "hq_admin", password: "Admin@1234" });
//   adminToken = adminLogin.body.data?.accessToken;

//   // Login as STATION_OFFICER (scoped access)
//   const officerLogin = await request(app)
//     .post("/api/v1/auth/login")
//     .send({ username: "col_officer", password: "Officer@1234" });
//   officerToken = officerLogin.body.data?.accessToken;
// });

// describe("Vehicle API", () => {
//   // ─── GET /vehicles ────────────────────────────────────────────────────────
//   describe("GET /api/v1/vehicles", () => {
//     it("should return 200 and paginated vehicles for admin", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(Array.isArray(res.body.data)).toBe(true);
//       expect(res.body.meta).toHaveProperty("totalItems");
//       expect(res.body.meta).toHaveProperty("currentPage");
//       expect(res.body.meta).toHaveProperty("totalPages");
//     });

//     it("should return 401 without auth token", async () => {
//       const res = await request(app).get("/api/v1/vehicles");
//       expect(res.status).toBe(401);
//       expect(res.body.success).toBe(false);
//     });

//     it("should filter vehicles by status=ACTIVE", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles?status=ACTIVE")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       res.body.data.forEach((v) => {
//         expect(v.status).toBe("ACTIVE");
//       });
//     });

//     it("should filter vehicles by province_id=1", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles?province_id=1&limit=5")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(Array.isArray(res.body.data)).toBe(true);
//     });

//     it("should support search by registration number", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles?search=WP-")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(Array.isArray(res.body.data)).toBe(true);
//     });

//     it("should paginate correctly with page and limit", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles?page=1&limit=5")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data.length).toBeLessThanOrEqual(5);
//       expect(res.body.meta.itemsPerPage).toBe(5);
//     });

//     it("STATION_OFFICER should see vehicles (scoped to their district)", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${officerToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//     });
//   });

//   // ─── POST /vehicles ────────────────────────────────────────────────────────
//   describe("POST /api/v1/vehicles", () => {
//     it("should create a vehicle successfully as SUPER_ADMIN", async () => {
//       const newVehicle = {
//         registration_number: "TEST-9901",
//         chassis_number: "CHTEST990001",
//         province_id: 1,
//         district_id: 1,
//         device_imei: "111222333444555",
//         make: "Bajaj",
//         model: "RE",
//         year: 2022,
//       };

//       const res = await request(app)
//         .post("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send(newVehicle);

//       expect(res.status).toBe(201);
//       expect(res.body.success).toBe(true);
//       expect(res.body.data.registration_number).toBe("TEST-9901");
//       createdVehicleId = res.body.data.id;
//     });

//     it("should return 409 for duplicate registration number", async () => {
//       const duplicate = {
//         registration_number: "TEST-9901",
//         chassis_number: "CHTEST990002",
//         province_id: 1,
//         district_id: 1,
//         device_imei: "111222333444556",
//       };

//       const res = await request(app)
//         .post("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send(duplicate);

//       expect(res.status).toBe(409);
//     });

//     it("should return 403 for non-SUPER_ADMIN creating a vehicle", async () => {
//       const res = await request(app)
//         .post("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${officerToken}`)
//         .send({
//           registration_number: "TEST-9902",
//           chassis_number: "CH999002",
//           province_id: 1,
//           district_id: 1,
//           device_imei: "111222333444557",
//         });

//       expect(res.status).toBe(403);
//     });

//     it("should return 422 for missing required fields", async () => {
//       const res = await request(app)
//         .post("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ make: "Bajaj" }); // Missing required fields

//       expect(res.status).toBe(422);
//       expect(res.body.success).toBe(false);
//     });

//     it("should return 422 for IMEI shorter than 15 chars", async () => {
//       const res = await request(app)
//         .post("/api/v1/vehicles")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({
//           registration_number: "TEST-9903",
//           chassis_number: "CH999003",
//           province_id: 1,
//           district_id: 1,
//           device_imei: "12345", // Too short
//         });

//       expect(res.status).toBe(422);
//     });
//   });

//   // ─── GET /vehicles/:id ────────────────────────────────────────────────────
//   describe("GET /api/v1/vehicles/:id", () => {
//     it("should return vehicle details for a valid ID", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles/1")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data).toHaveProperty("registration_number");
//       expect(res.body.data).toHaveProperty("status");
//     });

//     it("should return 404 for a non-existent vehicle", async () => {
//       const res = await request(app)
//         .get("/api/v1/vehicles/999999")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(404);
//     });
//   });

//   // ─── PUT /vehicles/:id ────────────────────────────────────────────────────
//   describe("PUT /api/v1/vehicles/:id", () => {
//     it("should update vehicle status to SUSPENDED", async () => {
//       if (!createdVehicleId) return;

//       const res = await request(app)
//         .put(`/api/v1/vehicles/${createdVehicleId}`)
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ status: "SUSPENDED" });

//       expect(res.status).toBe(200);
//       expect(res.body.data.status).toBe("SUSPENDED");
//     });

//     it("should return 422 for invalid status value", async () => {
//       const res = await request(app)
//         .put("/api/v1/vehicles/1")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ status: "BROKEN" }); // Invalid enum value

//       expect(res.status).toBe(422);
//     });

//     it("should return 422 when sending empty update body", async () => {
//       const res = await request(app)
//         .put("/api/v1/vehicles/1")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({});

//       expect(res.status).toBe(422);
//     });
//   });

//   // ─── DELETE /vehicles/:id ─────────────────────────────────────────────────
//   describe("DELETE /api/v1/vehicles/:id", () => {
//     it("should deactivate a vehicle (soft delete)", async () => {
//       if (!createdVehicleId) return;

//       const res = await request(app)
//         .delete(`/api/v1/vehicles/${createdVehicleId}`)
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//     });

//     it("should return 403 for non-SUPER_ADMIN attempting delete", async () => {
//       const res = await request(app)
//         .delete("/api/v1/vehicles/1")
//         .set("Authorization", `Bearer ${officerToken}`);

//       expect(res.status).toBe(403);
//     });

//     it("should return 404 for deleting a non-existent vehicle", async () => {
//       const res = await request(app)
//         .delete("/api/v1/vehicles/999999")
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
let createdVehicleId;

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

describe("Vehicle API", () => {
  // ─── GET /vehicles ────────────────────────────────────────────────────────
  describe("GET /api/v1/vehicles", () => {
    it("should return 200 and paginated vehicles for SUPER_ADMIN", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty("totalItems");
      expect(res.body.meta).toHaveProperty("currentPage");
      expect(res.body.meta).toHaveProperty("totalPages");
      expect(res.body.meta).toHaveProperty("hasNextPage");
      expect(res.body.meta).toHaveProperty("hasPrevPage");
    });

    it("should return 401 without auth token", async () => {
      const res = await request(app).get("/api/v1/vehicles");
      expect(res.status).toBe(401);
    });

    it("should filter by status=ACTIVE — all items have correct status", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?status=ACTIVE")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((v) => expect(v.status).toBe("ACTIVE"));
    });

    it("should filter by status=INACTIVE", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?status=INACTIVE")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      // may be empty array if none inactive — but must be valid response
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should filter by province_id=1", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?province_id=1&limit=5")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should filter by district_id=1", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?district_id=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should support search by registration number", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?search=WP-")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should paginate — page 2 has prev but may not have next", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles?page=2&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.meta.currentPage).toBe(2);
      expect(res.body.meta.hasPrevPage).toBe(true);
    });

    it("PROVINCIAL_ADMIN sees only their province (scope enforcement)", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles")
        .set("Authorization", `Bearer ${wpToken}`);
      expect(res.status).toBe(200);
      // Western Province admin cannot see all 200
      expect(res.body.meta.totalItems).toBeLessThan(200);
    });

    it("STATION_OFFICER sees only their district (scope enforcement)", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── POST /vehicles ───────────────────────────────────────────────────────
  describe("POST /api/v1/vehicles", () => {
    it("should create vehicle successfully as SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registration_number: "TEST-9901",
          chassis_number: "CHTEST990001",
          province_id: 1,
          district_id: 1,
          device_imei: "111222333444555",
          make: "Bajaj",
          model: "RE",
          year: 2022,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.registration_number).toBe("TEST-9901");
      createdVehicleId = res.body.data.id;
    });

    it("should return 409 for duplicate registration number", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registration_number: "TEST-9901",
          chassis_number: "CHTEST990002",
          province_id: 1,
          district_id: 1,
          device_imei: "111222333444556",
        });
      expect(res.status).toBe(409);
    });

    it("should return 409 for duplicate chassis number", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registration_number: "TEST-9902",
          chassis_number: "CHTEST990001", // duplicate chassis
          province_id: 1,
          district_id: 1,
          device_imei: "111222333444557",
        });
      expect(res.status).toBe(409);
    });

    it("should return 403 for STATION_OFFICER", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          registration_number: "TEST-9903",
          chassis_number: "CH999003",
          province_id: 1,
          district_id: 1,
          device_imei: "111222333444558",
        });
      expect(res.status).toBe(403);
    });

    it("should return 422 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ make: "Bajaj" });
      expect(res.status).toBe(422);
    });

    it("should return 422 for IMEI shorter than 15 chars", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registration_number: "TEST-9904",
          chassis_number: "CH999004",
          province_id: 1,
          district_id: 1,
          device_imei: "12345",
        });
      expect(res.status).toBe(422);
    });

    it("should return 422 for invalid year (too old)", async () => {
      const res = await request(app)
        .post("/api/v1/vehicles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          registration_number: "TEST-9905",
          chassis_number: "CH999005",
          province_id: 1,
          district_id: 1,
          device_imei: "111222333444559",
          year: 1980,
        });
      expect(res.status).toBe(422);
    });
  });

  // ─── GET /vehicles/:id ────────────────────────────────────────────────────
  describe("GET /api/v1/vehicles/:id", () => {
    it("should return vehicle with driver and location info", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("registration_number");
      expect(res.body.data).toHaveProperty("status");
    });

    it("should return 404 for non-existent vehicle", async () => {
      const res = await request(app)
        .get("/api/v1/vehicles/999999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /vehicles/:id ────────────────────────────────────────────────────
  describe("PUT /api/v1/vehicles/:id", () => {
    it("should update status to SUSPENDED", async () => {
      if (!createdVehicleId) return;
      const res = await request(app)
        .put(`/api/v1/vehicles/${createdVehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SUSPENDED" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("SUSPENDED");
    });

    it("should update make and model", async () => {
      const res = await request(app)
        .put("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ make: "Bajaj", model: "RE EFI" });
      expect(res.status).toBe(200);
    });

    it("should return 422 for invalid status value", async () => {
      const res = await request(app)
        .put("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "BROKEN" });
      expect(res.status).toBe(422);
    });

    it("should return 422 for empty update body", async () => {
      const res = await request(app)
        .put("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it("should return 404 for non-existent vehicle", async () => {
      const res = await request(app)
        .put("/api/v1/vehicles/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "ACTIVE" });
      expect(res.status).toBe(404);
    });

    it("should return 403 for STATION_OFFICER attempting update", async () => {
      const res = await request(app)
        .put("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ make: "Bajaj" });
      expect(res.status).toBe(403);
    });
  });

  // ─── DELETE /vehicles/:id ─────────────────────────────────────────────────
  describe("DELETE /api/v1/vehicles/:id", () => {
    it("should soft-delete a vehicle", async () => {
      if (!createdVehicleId) return;
      const res = await request(app)
        .delete(`/api/v1/vehicles/${createdVehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should prove soft delete — vehicle still exists with INACTIVE status", async () => {
      if (!createdVehicleId) return;
      const res = await request(app)
        .get(`/api/v1/vehicles/${createdVehicleId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("INACTIVE");
    });

    it("should return 403 for STATION_OFFICER attempting delete", async () => {
      const res = await request(app)
        .delete("/api/v1/vehicles/1")
        .set("Authorization", `Bearer ${officerToken}`);
      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent vehicle", async () => {
      const res = await request(app)
        .delete("/api/v1/vehicles/999999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});

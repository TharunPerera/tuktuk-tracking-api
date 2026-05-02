const request = require("supertest");
const app = require("../src/app");

let adminToken;
let wpToken;
let officerToken;

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

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
describe("Health Check", () => {
  it("GET /health should return 200 with all fields", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("environment");
    expect(res.body).toHaveProperty("uptime_seconds");
  });

  it("GET /health/db should return database connected with vehicle count", async () => {
    const res = await request(app).get("/health/db");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("connected");
    expect(res.body).toHaveProperty("vehicle_count");
  });
});

// ─── PROVINCES ───────────────────────────────────────────────────────────────
describe("Provinces API", () => {
  describe("GET /api/v1/provinces", () => {
    it("should return exactly 9 provinces with districts nested", async () => {
      const res = await request(app)
        .get("/api/v1/provinces")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(9);
      expect(res.body.data[0]).toHaveProperty("districts");
      expect(Array.isArray(res.body.data[0].districts)).toBe(true);
    });

    it("should return provinces sorted by name", async () => {
      const res = await request(app)
        .get("/api/v1/provinces")
        .set("Authorization", `Bearer ${adminToken}`);
      const names = res.body.data.map((p) => p.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/v1/provinces");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/provinces/:id", () => {
    it("should return province id=1 with code and name", async () => {
      const res = await request(app)
        .get("/api/v1/provinces/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("code");
      expect(res.body.data).toHaveProperty("districts");
    });

    it("should return 404 for non-existent province", async () => {
      const res = await request(app)
        .get("/api/v1/provinces/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/provinces", () => {
    it("should create a new province as SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/provinces")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Province Coverage",
          code: "TPC",
          latitude: 7.5,
          longitude: 80.5,
        });
      // 201 created or 409 if already exists from previous test run
      expect([201, 409]).toContain(res.status);
    });

    it("should return 403 for STATION_OFFICER creating province", async () => {
      const res = await request(app)
        .post("/api/v1/provinces")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ name: "Unauthorized Province", code: "UNP" });
      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/v1/provinces/:id", () => {
    it("should update a province as SUPER_ADMIN", async () => {
      const res = await request(app)
        .put("/api/v1/provinces/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ latitude: 6.9272, longitude: 79.8613 });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent province", async () => {
      const res = await request(app)
        .put("/api/v1/provinces/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ latitude: 7.0 });
      expect(res.status).toBe(404);
    });

    it("should return 403 for STATION_OFFICER", async () => {
      const res = await request(app)
        .put("/api/v1/provinces/1")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ latitude: 7.0 });
      expect(res.status).toBe(403);
    });
  });
});

// ─── DISTRICTS ───────────────────────────────────────────────────────────────
describe("Districts API", () => {
  describe("GET /api/v1/districts", () => {
    it("should return 25+ districts", async () => {
      const res = await request(app)
        .get("/api/v1/districts")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(25);
    });

    it("should filter by province_id=1 — exactly 3 districts (WP)", async () => {
      const res = await request(app)
        .get("/api/v1/districts?province_id=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      res.body.data.forEach((d) => expect(d.province_id).toBe(1));
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/v1/districts");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/districts/:id", () => {
    it("should return district with province and stations nested", async () => {
      const res = await request(app)
        .get("/api/v1/districts/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("stations");
      expect(res.body.data).toHaveProperty("province");
    });

    it("should return 404 for non-existent district", async () => {
      const res = await request(app)
        .get("/api/v1/districts/99999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/districts", () => {
    it("should create a new district as SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/districts")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test District Coverage",
          code: "TDC",
          province_id: 1,
          latitude: 6.9,
          longitude: 79.8,
        });
      expect([201, 409]).toContain(res.status);
    });

    it("should return 403 for non-admin creating district", async () => {
      const res = await request(app)
        .post("/api/v1/districts")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({ name: "Fail District", code: "FD1", province_id: 1 });
      expect(res.status).toBe(403);
    });
  });
});

// ─── POLICE STATIONS ─────────────────────────────────────────────────────────
describe("Police Stations API", () => {
  describe("GET /api/v1/stations", () => {
    it("should return 21 stations", async () => {
      const res = await request(app)
        .get("/api/v1/stations")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(20);
    });

    it("should filter by district_id=1", async () => {
      const res = await request(app)
        .get("/api/v1/stations?district_id=1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((s) => expect(s.district_id).toBe(1));
    });

    it("should filter by station_type=HEADQUARTERS", async () => {
      const res = await request(app)
        .get("/api/v1/stations?station_type=HEADQUARTERS")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((s) => expect(s.station_type).toBe("HEADQUARTERS"));
    });

    it("should filter by station_type=PROVINCIAL", async () => {
      const res = await request(app)
        .get("/api/v1/stations?station_type=PROVINCIAL")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.forEach((s) => expect(s.station_type).toBe("PROVINCIAL"));
    });

    it("should filter by station_type=DISTRICT", async () => {
      const res = await request(app)
        .get("/api/v1/stations?station_type=DISTRICT")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it("should filter by is_active=true", async () => {
      const res = await request(app)
        .get("/api/v1/stations?is_active=true")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/stations/:id", () => {
    it("should return station with district + province chain", async () => {
      const res = await request(app)
        .get("/api/v1/stations/1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("district");
      expect(res.body.data.district).toHaveProperty("province");
    });

    it("should return 404 for non-existent station", async () => {
      const res = await request(app)
        .get("/api/v1/stations/99999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/v1/stations", () => {
    it("should create a station as SUPER_ADMIN", async () => {
      const res = await request(app)
        .post("/api/v1/stations")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Coverage Station",
          code: "COV-TEST-001",
          district_id: 1,
          station_type: "DISTRICT",
          address: "Test Address, Colombo",
        });
      expect([201, 409]).toContain(res.status);
    });

    it("should return 403 for STATION_OFFICER creating station", async () => {
      const res = await request(app)
        .post("/api/v1/stations")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          name: "Fail Station",
          code: "FAIL-ST",
          district_id: 1,
          station_type: "DISTRICT",
        });
      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/v1/stations/:id", () => {
    it("should update a station as SUPER_ADMIN", async () => {
      const res = await request(app)
        .put("/api/v1/stations/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phone: "+94112421111" });
      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent station", async () => {
      const res = await request(app)
        .put("/api/v1/stations/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ phone: "+94112421111" });
      expect(res.status).toBe(404);
    });
  });
});

// ─── STATISTICS ───────────────────────────────────────────────────────────────
describe("Statistics API", () => {
  it("GET /stats as SUPER_ADMIN — full province breakdown", async () => {
    const res = await request(app)
      .get("/api/v1/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveProperty("total");
    expect(res.body.data.vehicles).toHaveProperty("active");
    expect(res.body.data.drivers).toHaveProperty("total");
    expect(res.body.data.location_pings).toHaveProperty("total");
    expect(res.body.data).toHaveProperty("by_province");
    expect(res.body.data).toHaveProperty("hourly_activity");
    expect(res.body.data).toHaveProperty("generated_at");
  });

  it("GET /stats as PROVINCIAL_ADMIN — scoped data (no by_province)", async () => {
    const res = await request(app)
      .get("/api/v1/stats")
      .set("Authorization", `Bearer ${wpToken}`);
    expect(res.status).toBe(200);
    // Provincial admin has scope — by_province is null
    expect(res.body.data.by_province).toBeNull();
  });

  it("GET /stats returns 403 for STATION_OFFICER", async () => {
    const res = await request(app)
      .get("/api/v1/stats")
      .set("Authorization", `Bearer ${officerToken}`);
    expect(res.status).toBe(403);
  });

  it("GET /stats/vehicles as admin — district breakdown", async () => {
    const res = await request(app)
      .get("/api/v1/stats/vehicles")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("GET /stats/vehicles as STATION_OFFICER — allowed but scoped", async () => {
    const res = await request(app)
      .get("/api/v1/stats/vehicles")
      .set("Authorization", `Bearer ${officerToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /stats/vehicles with province_id filter", async () => {
    const res = await request(app)
      .get("/api/v1/stats/vehicles?province_id=1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
describe("Users API", () => {
  it("GET /users as SUPER_ADMIN — returns paginated users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty("totalItems");
    expect(res.body.meta.totalItems).toBeGreaterThan(200);
  });

  it("GET /users filtered by role=STATION_OFFICER", async () => {
    const res = await request(app)
      .get("/api/v1/users?role=STATION_OFFICER")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((u) => expect(u.role).toBe("STATION_OFFICER"));
  });

  it("GET /users filtered by role=DEVICE_CLIENT", async () => {
    const res = await request(app)
      .get("/api/v1/users?role=DEVICE_CLIENT")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /users filtered by is_active=true", async () => {
    const res = await request(app)
      .get("/api/v1/users?is_active=true")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /users with search", async () => {
    const res = await request(app)
      .get("/api/v1/users?search=admin")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("GET /users/:id returns user with ETag", async () => {
    const res = await request(app)
      .get("/api/v1/users/1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers["etag"]).toBeDefined();
  });

  it("GET /users/:id returns 304 with matching ETag", async () => {
    const first = await request(app)
      .get("/api/v1/users/1")
      .set("Authorization", `Bearer ${adminToken}`);
    const etag = first.headers["etag"];

    const second = await request(app)
      .get("/api/v1/users/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .set("If-None-Match", etag);
    expect(second.status).toBe(304);
  });

  it("GET /users/:id returns 404 for non-existent user", async () => {
    const res = await request(app)
      .get("/api/v1/users/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("GET /users returns 403 for STATION_OFFICER", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${officerToken}`);
    expect(res.status).toBe(403);
  });

  it("PUT /users/:id updates user fields", async () => {
    // update col_officer (id 3)
    const res = await request(app)
      .put("/api/v1/users/3")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ full_name: "Updated Officer Name" });
    expect(res.status).toBe(200);
  });

  it("DELETE /users/:id deactivates user (not self)", async () => {
    // Create a throwaway user first
    const reg = await request(app)
      .post("/api/v1/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: "delete_me_user",
        email: "deleteme@police.lk",
        password: "Delete@1234",
        full_name: "Delete Me",
        role: "STATION_OFFICER",
      });
    // 201 or 409 if already exists
    if (reg.status === 201) {
      const userId = reg.body.data.id;
      const del = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(del.status).toBe(200);
    }
  });

  it("DELETE /users/:id returns 409 when trying to delete self", async () => {
    const res = await request(app)
      .delete("/api/v1/users/1") // hq_admin is user id 1
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it("DELETE /users/:id returns 404 for non-existent user", async () => {
    const res = await request(app)
      .delete("/api/v1/users/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// const request = require("supertest");
// const app = require("../src/app");

// // Note: These tests require a running test database
// // For CI, we use the DATABASE_URL from GitHub Secrets

// describe("Authentication API", () => {
//   describe("POST /api/v1/auth/login", () => {
//     it("should return 200 and tokens for valid credentials", async () => {
//       const response = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "hq_admin", password: "Admin@1234" });

//       expect(response.status).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty("accessToken");
//       expect(response.body.data).toHaveProperty("refreshToken");
//       expect(response.body.data.user.role).toBe("SUPER_ADMIN");
//     });

//     it("should return 401 for invalid credentials", async () => {
//       const response = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "hq_admin", password: "WrongPassword" });

//       expect(response.status).toBe(401);
//       expect(response.body.success).toBe(false);
//     });

//     it("should return 422 for missing password", async () => {
//       const response = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "hq_admin" });

//       expect(response.status).toBe(422);
//       expect(response.body.success).toBe(false);
//     });

//     it("should return 422 for too short username", async () => {
//       const response = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "ab", password: "password123" });

//       expect(response.status).toBe(422);
//     });
//   });

//   describe("GET /api/v1/auth/profile", () => {
//     it("should return 401 without token", async () => {
//       const response = await request(app).get("/api/v1/auth/profile");
//       expect(response.status).toBe(401);
//     });

//     it("should return profile with valid token", async () => {
//       // Login first to get token
//       const loginRes = await request(app)
//         .post("/api/v1/auth/login")
//         .send({ username: "hq_admin", password: "Admin@1234" });

//       const token = loginRes.body.data.accessToken;

//       const response = await request(app)
//         .get("/api/v1/auth/profile")
//         .set("Authorization", `Bearer ${token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.data.username).toBe("hq_admin");
//     });
//   });
// });

const request = require("supertest");
const app = require("../src/app");

describe("Authentication API", () => {
  let savedRefreshToken;

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/login", () => {
    it("should return 200 and tokens for valid SUPER_ADMIN credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "Admin@1234" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.role).toBe("SUPER_ADMIN");
      savedRefreshToken = response.body.data.refreshToken;
    });

    it("should return 200 for PROVINCIAL_ADMIN login", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "wp_admin", password: "WPAdmin@1234" });
      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe("PROVINCIAL_ADMIN");
    });

    it("should return 200 for STATION_OFFICER login", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "col_officer", password: "Officer@1234" });
      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe("STATION_OFFICER");
    });

    it("should return 401 for wrong password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "WrongPassword" });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for non-existent username", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "doesnotexist", password: "Password123" });
      expect(response.status).toBe(401);
    });

    it("should return 422 for missing password field", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin" });
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it("should return 422 for username too short (< 3 chars)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "ab", password: "password123" });
      expect(response.status).toBe(422);
    });

    it("should return 422 for password too short (< 6 chars)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "abc" });
      expect(response.status).toBe(422);
    });

    it("should return 422 for username with invalid characters", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "user@name!", password: "password123" });
      expect(response.status).toBe(422);
    });
  });

  // ─── PROFILE ──────────────────────────────────────────────────────────────
  describe("GET /api/v1/auth/profile", () => {
    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/auth/profile");
      expect(response.status).toBe(401);
    });

    it("should return 401 with malformed token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer not.a.real.token");
      expect(response.status).toBe(401);
    });

    it("should return 401 with wrong scheme (no Bearer prefix)", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Token somevalue");
      expect(response.status).toBe(401);
    });

    it("should return profile with valid token", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "Admin@1234" });
      const token = loginRes.body.data.accessToken;

      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe("hq_admin");
    });
  });

  // ─── REFRESH ──────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/refresh", () => {
    it("should return new access token with valid refresh token", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "Admin@1234" });
      const refreshToken = loginRes.body.data.refreshToken;

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid-refresh-token-value" });
      expect(response.status).toBe(401);
    });

    it("should return 422 for missing refreshToken field", async () => {
      const response = await request(app).post("/api/v1/auth/refresh").send({});
      expect(response.status).toBe(422);
    });
  });

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/logout", () => {
    it("should return 200 and revoke the refresh token", async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "Admin@1234" });
      const refreshToken = loginRes.body.data.refreshToken;

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({ refreshToken });
      expect(response.status).toBe(200);

      // Confirm token is revoked — refresh should fail now
      const refreshAttempt = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken });
      expect(refreshAttempt.status).toBe(401);
    });

    it("should return 200 even if no refreshToken is provided (graceful)", async () => {
      const response = await request(app).post("/api/v1/auth/logout").send({});
      expect(response.status).toBe(200);
    });
  });

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  describe("POST /api/v1/auth/register", () => {
    let adminToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "hq_admin", password: "Admin@1234" });
      adminToken = loginRes.body.data.accessToken;
    });

    it("should register a new STATION_OFFICER as admin", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "test_officer_reg",
          email: "test_officer_reg@police.lk",
          password: "Officer@9999",
          full_name: "Test Registration Officer",
          role: "STATION_OFFICER",
          province_id: 1,
          district_id: 1,
          station_id: 1,
          badge_number: "REG-TEST-001",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe("STATION_OFFICER");
    });

    it("should return 409 for duplicate username", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "hq_admin", // already exists
          email: "newemail@police.lk",
          password: "Password@1234",
          full_name: "Duplicate Test",
          role: "STATION_OFFICER",
        });
      expect(response.status).toBe(409);
    });

    it("should return 403 when non-admin tries to register", async () => {
      const officerLogin = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "col_officer", password: "Officer@1234" });
      const officerToken = officerLogin.body.data.accessToken;

      const response = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${officerToken}`)
        .send({
          username: "newuser_fail",
          email: "fail@police.lk",
          password: "Password@123",
          full_name: "Should Fail",
          role: "STATION_OFFICER",
        });
      expect(response.status).toBe(403);
    });

    it("should return 422 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "valid_user_xyz",
          email: "not-an-email",
          password: "Password@123",
          full_name: "Test User",
          role: "STATION_OFFICER",
        });
      expect(response.status).toBe(422);
    });

    it("should return 422 for invalid role value", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "another_user_xyz",
          email: "another@police.lk",
          password: "Password@123",
          full_name: "Another Test",
          role: "INVALID_ROLE",
        });
      expect(response.status).toBe(422);
    });
  });
});

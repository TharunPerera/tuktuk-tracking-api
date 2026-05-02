const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🚗 Tuk-Tuk Tracking API",
      version: "1.0.0",
      description: `
## Sri Lanka Police - Real-Time Three-Wheeler Tracking System

A RESTful API for tracking registered tuk-tuks across Sri Lanka using GPS pings.

---

## 📋 Test Credentials

Use these credentials to test different role permissions:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| 👑 **SUPER_ADMIN** | \`hq_admin\` | \`Admin@1234\` | Full system access - all provinces, districts, and vehicles |
| 🏛️ **PROVINCIAL_ADMIN** | \`wp_admin\` | \`WPAdmin@1234\` | Province-scoped access - Western Province only |
| 👮 **STATION_OFFICER** | \`col_officer\` | \`Officer@1234\` | District-scoped access - Colombo district only |
| 📡 **DEVICE_CLIENT** | \`device_352148078300001\` | \`Device@352148078300001\` | GPS device - can only submit location pings |

---

## 🔐 Role-Based Access Control (RBAC)

| Endpoint | SUPER_ADMIN | PROVINCIAL_ADMIN | STATION_OFFICER | DEVICE_CLIENT |
|----------|-------------|------------------|-----------------|---------------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| GET /auth/profile | ✅ | ✅ | ✅ | ✅ |
| POST /locations/ping | ✅ | ❌ | ❌ | ✅ |
| GET /locations/live | ✅ | ✅ (scoped) | ✅ (scoped) | ❌ |
| GET /locations/:id/history | ✅ | ✅ (scoped) | ✅ (scoped) | ❌ |
| GET /vehicles | ✅ | ✅ (scoped) | ✅ (scoped) | ❌ |
| POST /vehicles | ✅ | ❌ | ❌ | ❌ |
| PUT /vehicles/:id | ✅ | ✅ (scoped) | ❌ | ❌ |
| DELETE /vehicles/:id | ✅ | ❌ | ❌ | ❌ |
| GET /provinces | ✅ | ✅ | ✅ | ❌ |
| POST /provinces | ✅ | ❌ | ❌ | ❌ |
| GET /districts | ✅ | ✅ | ✅ | ❌ |
| POST /districts | ✅ | ❌ | ❌ | ❌ |
| GET /stations | ✅ | ✅ | ✅ | ❌ |
| POST /stations | ✅ | ❌ | ❌ | ❌ |
| GET /drivers | ✅ | ✅ | ✅ | ❌ |
| POST /drivers | ✅ | ❌ | ❌ | ❌ |
| GET /users | ✅ | ❌ | ❌ | ❌ |
| GET /stats | ✅ | ✅ | ❌ | ❌ |

**Note:** "scoped" means the user only sees data within their assigned province or district.

---

## ⏱️ Rate Limiting

- **General users:** 100 requests / 15 minutes
- **Device clients:** 200 requests / 15 minutes  
- **Auth endpoints:** 10 requests / 15 minutes

---

## 🔑 Authentication

1. Call \`POST /api/v1/auth/login\` with credentials
2. Copy the \`accessToken\` from response
3. Click **Authorize** button above and enter: \`Bearer YOUR_TOKEN\`
4. All subsequent requests will include the token

---

## 🏷️ Why Use Filter by Tag?

The **Filter by Tag** feature (search box above) allows you to:

| Use Case | Benefit |
|----------|---------|
| **Role-based testing** | Filter by "Authentication" to quickly find login/logout endpoints when testing different user roles |
| **Focus on specific modules** | Select "Location" tag to see only GPS ping endpoints during device simulation |
| **Debug specific issues** | Filter to "Statistics" to monitor system health during VIVA presentation |
| **API documentation navigation** | Instead of scrolling through all 30+ endpoints, jump directly to relevant functionality |

**Available Tags:** Authentication, Location, Vehicles, Geography, Drivers, Statistics, Users

---

## 🚀 Quick Start Guide

### For VIVA Presentation:
1. **Filter by "Authentication"** → Login with SUPER_ADMIN credentials
2. **Filter by "Vehicles"** → Show all 200 registered tuk-tuks
3. **Filter by "Location"** → Get live positions and movement history
4. **Filter by "Statistics"** → Show system-wide analytics

### For Testing RBAC:
1. Login as different roles and observe scoped data
2. Use tag filters to quickly switch between endpoints
3. Verify STATION_OFFICER sees only Colombo district vehicles

      `,
      contact: {
        name: "Student ID: 16114151",
        email: "student@nibm.lk",
      },
    },
    servers: [
      {
        url: process.env.RAILWAY_PUBLIC_DOMAIN
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/v1`
          : `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter: Bearer {your-jwt-token} (Get token from POST /auth/login)",
        },
      },
      parameters: {
        pageParam: {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination (starts at 1)",
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
        },
        limitParam: {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of items per page (max 100)",
          schema: {
            type: "integer",
            default: 20,
            minimum: 1,
            maximum: 100,
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: "Authentication",
        description:
          "Login, logout, token refresh - No authentication required for login",
      },
      {
        name: "Location",
        description:
          "GPS ping submission and location history - Requires authentication",
      },
      {
        name: "Vehicles",
        description:
          "Vehicle registration and management - Requires authentication",
      },
      {
        name: "Geography",
        description:
          "Provinces, districts, police stations - Read-only for most roles",
      },
      {
        name: "Drivers",
        description: "Tuk-tuk driver registration and management",
      },
      {
        name: "Statistics",
        description: "System-wide monitoring and analytics (HQ dashboard)",
      },
      {
        name: "Users",
        description: "User management (SUPER_ADMIN only)",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Tuk-Tuk Tracking API Docs | Sri Lanka Police",
      swaggerOptions: {
        persistAuthorization: true, // Keeps token after page refresh
        displayRequestDuration: true, // Shows request duration
        filter: true, // Enables endpoint filtering by tag
        tryItOutEnabled: true, // Auto-enables try it out
        // Show tag filtering explanation in console
        onComplete: () => {
          console.log(`
📚 Swagger UI Loaded!
🏷️  Use the "Filter by tag" box above to show only specific endpoint groups
   Examples: "Authentication", "Location", "Vehicles", "Statistics"
          `);
        },
      },
    }),
  );

  // Raw JSON spec endpoint for Postman/OpenAPI tools
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger };

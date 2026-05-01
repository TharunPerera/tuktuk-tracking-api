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

### Authentication
Use **Bearer Token** authentication. Login at \`/api/v1/auth/login\` to get your JWT token.

### Roles
- **SUPER_ADMIN** - Full access (HQ)
- **PROVINCIAL_ADMIN** - Province-scoped access  
- **STATION_OFFICER** - District/Station-scoped access
- **DEVICE_CLIENT** - GPS device, ping-only access

### Rate Limiting
- General: 100 requests / 15 minutes
- Device pings: 200 requests / 15 minutes
- Auth: 10 requests / 15 minutes
      `,
      contact: {
        name: "Student ID: YOUR_ID_HERE",
      },
    },
    // servers: [
    //   {
    //     url:
    //       process.env.NODE_ENV === "production"
    //         ? "https://your-railway-domain.railway.app/api/v1"
    //         : `http://localhost:${process.env.PORT || 3000}/api/v1`,
    //     description:
    //       process.env.NODE_ENV === "production" ? "Production" : "Development",
    //   },
    // ],
    servers: [
      {
        url: process.env.RAILWAY_PUBLIC_DOMAIN
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/v1`
          : `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter: Bearer {your-jwt-token}",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Authentication", description: "Login, logout, token refresh" },
      {
        name: "Location",
        description: "GPS ping submission and location history",
      },
      { name: "Vehicles", description: "Vehicle registration and management" },
      {
        name: "Geography",
        description: "Provinces, districts, police stations",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Reads JSDoc comments from route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Tuk-Tuk Tracking API Docs",
    }),
  );

  // Also expose raw JSON spec (useful for Postman import)
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger };

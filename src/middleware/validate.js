const { sendError } = require("../utils/response");

// Middleware factory: takes a Joi schema and returns a middleware function
// Usage: router.post('/login', validate(loginSchema), authController.login)
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Collect ALL validation errors, not just the first
      stripUnknown: true, // Remove fields not in schema (security: prevents extra fields)
      convert: true, // Auto-convert types (e.g., string "30.5" to number 30.5 for lat/lng)
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""), // Clean up Joi's quote formatting
      }));

      return sendError(res, 422, "Validation failed", errors);
    }

    // Replace req.body with validated & sanitized value
    req.body = value;
    next();
  };
};

// Validate query parameters (for GET requests with filters)
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/['"]/g, ""),
      }));

      return sendError(res, 422, "Invalid query parameters", errors);
    }

    req.query = value;
    next();
  };
};

module.exports = { validate, validateQuery };

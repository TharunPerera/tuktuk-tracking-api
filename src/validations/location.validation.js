const Joi = require("joi");

const locationPingSchema = Joi.object({
  device_imei: Joi.string().length(15).required().messages({
    "string.length": "IMEI must be exactly 15 digits",
  }),
  latitude: Joi.number().min(5.5).max(10.5).required().messages({
    "number.min": "Latitude must be within Sri Lanka bounds (5.5 to 10.5)",
  }),
  longitude: Joi.number().min(79.0).max(82.5).required(),
  speed: Joi.number().min(0).max(200).optional().default(0),
  heading: Joi.number().min(0).max(360).optional().default(0),
  accuracy: Joi.number().min(0).optional(),
  timestamp: Joi.date().iso().max("now").optional(),
});

// ISSUE #4 FIXED: 'from' is now REQUIRED - no query without start time
const historyQuerySchema = Joi.object({
  from: Joi.date().iso().required().messages({
    "any.required":
      "Start time (from) is required. Please specify a time window to query.",
    "date.base":
      "from must be a valid ISO 8601 date (e.g., 2026-04-25T14:00:00Z)",
  }),
  to: Joi.date()
    .iso()
    .min(Joi.ref("from"))
    .optional()
    .default(() => new Date())
    .messages({
      "date.min": "End time (to) must be after start time (from)",
    }),
  limit: Joi.number().integer().min(1).max(1000).optional().default(100),
  page: Joi.number().integer().min(1).optional().default(1),
});

const vehicleFilterSchema = Joi.object({
  province_id: Joi.number().integer().positive().optional(),
  district_id: Joi.number().integer().positive().optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  search: Joi.string().max(50).optional(),
});

module.exports = {
  locationPingSchema,
  historyQuerySchema,
  vehicleFilterSchema,
};

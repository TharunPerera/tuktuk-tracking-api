const Joi = require("joi");

// Schema for GPS device posting a location ping
const locationPingSchema = Joi.object({
  device_imei: Joi.string()
    .length(15)
    .required()
    .messages({ "string.length": "IMEI must be exactly 15 digits" }),

  // Sri Lanka latitude range: roughly 5.9 to 9.9
  latitude: Joi.number()
    .min(5.5)
    .max(10.5)
    .required()
    .messages({
      "number.min": "Latitude must be within Sri Lanka bounds (5.5 to 10.5)",
    }),

  // Sri Lanka longitude range: roughly 79.5 to 82.0
  longitude: Joi.number()
    .min(79.0)
    .max(82.5)
    .required()
    .messages({ "number.min": "Longitude must be within Sri Lanka bounds" }),

  speed: Joi.number().min(0).max(200).optional().default(0),
  heading: Joi.number().min(0).max(360).optional().default(0),
  accuracy: Joi.number().min(0).optional(),

  // Device sends its own timestamp (in case of network delay)
  timestamp: Joi.date().iso().max("now").optional(),
});

// Schema for querying location history
const historyQuerySchema = Joi.object({
  from: Joi.date()
    .iso()
    .required()
    .messages({ "any.required": "Start time (from) is required" }),
  to: Joi.date()
    .iso()
    .min(Joi.ref("from"))
    .optional()
    .default(() => new Date()),
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

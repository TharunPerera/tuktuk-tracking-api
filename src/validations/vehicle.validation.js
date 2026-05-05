const Joi = require("joi");

/**
 * Schema for creating a new vehicle
 * All required fields for vehicle registration
 */
const createVehicleSchema = Joi.object({
  registration_number: Joi.string().max(20).required().messages({
    "any.required": "Registration number is required",
    "string.max": "Registration number cannot exceed 20 characters",
  }),

  chassis_number: Joi.string().max(50).required().messages({
    "any.required": "Chassis number is required",
    "string.max": "Chassis number cannot exceed 50 characters",
  }),

  driver_id: Joi.number().integer().positive().optional().allow(null).messages({
    "number.positive": "Driver ID must be a positive integer",
  }),

  province_id: Joi.number().integer().positive().required().messages({
    "any.required": "Province ID is required",
    "number.positive": "Province ID must be a positive integer",
  }),

  district_id: Joi.number().integer().positive().required().messages({
    "any.required": "District ID is required",
    "number.positive": "District ID must be a positive integer",
  }),

  // ISSUE #3: jurisdiction_station_id for station-level assignment
  jurisdiction_station_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.positive": "Police station ID must be a positive integer",
    }),

  device_imei: Joi.string().min(15).max(17).required().messages({
    "any.required": "Device IMEI is required",
    "string.min": "IMEI must be at least 15 characters",
    "string.max": "IMEI cannot exceed 17 characters",
  }),

  make: Joi.string().max(50).optional().default("Bajaj").messages({
    "string.max": "Make cannot exceed 50 characters",
  }),

  model: Joi.string().max(50).optional().default("RE").messages({
    "string.max": "Model cannot exceed 50 characters",
  }),

  year: Joi.number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      "number.min": "Year must be 1990 or later",
      "number.max": `Year cannot be later than ${new Date().getFullYear() + 1}`,
    }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "SUSPENDED")
    .optional()
    .default("ACTIVE"),
});

/**
 * Schema for updating an existing vehicle
 * All fields are optional, but at least one is required
 * Note: registration_number and chassis_number are immutable and cannot be updated
 */
const updateVehicleSchema = Joi.object({
  driver_id: Joi.number().integer().positive().optional().allow(null).messages({
    "number.positive": "Driver ID must be a positive integer",
  }),

  device_imei: Joi.string().min(15).max(17).optional().messages({
    "string.min": "IMEI must be at least 15 characters",
    "string.max": "IMEI cannot exceed 17 characters",
  }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "SUSPENDED")
    .optional()
    .messages({
      "any.only": "Status must be ACTIVE, INACTIVE, or SUSPENDED",
    }),

  make: Joi.string().max(50).optional().messages({
    "string.max": "Make cannot exceed 50 characters",
  }),

  model: Joi.string().max(50).optional().messages({
    "string.max": "Model cannot exceed 50 characters",
  }),

  // ISSUE #3: Allow updating jurisdiction station
  jurisdiction_station_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.positive": "Police station ID must be a positive integer",
    }),

  year: Joi.number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      "number.min": "Year must be 1990 or later",
      "number.max": `Year cannot be later than ${new Date().getFullYear() + 1}`,
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * ISSUE #7 FIXED: Schema for driver assignment endpoint
 * Used by PATCH /vehicles/:id/assign-driver
 */
const assignDriverSchema = Joi.object({
  driver_id: Joi.number().integer().positive().allow(null).required().messages({
    "any.required":
      "driver_id is required (provide a positive integer or null to unassign)",
    "number.positive": "driver_id must be a positive integer",
  }),
});

/**
 * Schema for vehicle filtering query parameters
 */
const vehicleFilterSchema = Joi.object({
  province_id: Joi.number().integer().positive().optional(),

  district_id: Joi.number().integer().positive().optional(),

  status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").optional(),

  search: Joi.string().max(50).optional(),

  page: Joi.number().integer().min(1).optional().default(1),

  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  assignDriverSchema,
  vehicleFilterSchema,
};

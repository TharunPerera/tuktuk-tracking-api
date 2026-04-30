const Joi = require("joi");

const createVehicleSchema = Joi.object({
  registration_number: Joi.string().max(20).required(),
  chassis_number: Joi.string().max(50).required(),
  driver_id: Joi.number().integer().positive().optional().allow(null),
  province_id: Joi.number().integer().positive().required(),
  district_id: Joi.number().integer().positive().required(),
  device_imei: Joi.string().min(15).max(17).required(),
  make: Joi.string().max(50).optional().default("Bajaj"),
  model: Joi.string().max(50).optional().default("RE"),
  year: Joi.number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional(),
});

const updateVehicleSchema = Joi.object({
  driver_id: Joi.number().integer().positive().optional().allow(null),
  device_imei: Joi.string().min(15).max(17).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "SUSPENDED").optional(),
  make: Joi.string().max(50).optional(),
  model: Joi.string().max(50).optional(),
}).min(1); // At least one field required for update

module.exports = { createVehicleSchema, updateVehicleSchema };

const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      "any.required": "Username is required",
      "string.pattern.base":
        "Username must only contain letters, numbers, or underscores",
    }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
  }),
});

// ISSUE #1 & #2 FIXED: Device login validation schema
const deviceLoginSchema = Joi.object({
  device_imei: Joi.string().min(15).max(17).required().messages({
    "any.required": "Device IMEI is required",
    "string.min": "IMEI must be at least 15 characters",
  }),
});

const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(50)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  full_name: Joi.string().min(2).max(150).required(),
  role: Joi.string()
    .valid("PROVINCIAL_ADMIN", "STATION_OFFICER", "DEVICE_CLIENT")
    .required(),
  province_id: Joi.number().integer().positive().optional().allow(null),
  district_id: Joi.number().integer().positive().optional().allow(null),
  station_id: Joi.number().integer().positive().optional().allow(null),
  badge_number: Joi.string().max(20).optional().allow(null, ""),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  loginSchema,
  deviceLoginSchema,
  registerSchema,
  refreshSchema,
};

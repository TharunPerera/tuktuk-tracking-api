// const Joi = require("joi");

// const loginSchema = Joi.object({
//   username: Joi.string()
//     .alphanum()
//     .min(3)
//     .max(50)
//     .required()
//     .messages({ "any.required": "Username is required" }),
//   password: Joi.string()
//     .min(6)
//     .required()
//     .messages({ "any.required": "Password is required" }),
// });

// const registerSchema = Joi.object({
//   username: Joi.string().alphanum().min(3).max(50).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string()
//     .min(8)
//     .max(100)
//     .required()
//     .messages({ "string.min": "Password must be at least 8 characters" }),
//   full_name: Joi.string().min(2).max(150).required(),
//   role: Joi.string()
//     .valid("PROVINCIAL_ADMIN", "STATION_OFFICER", "DEVICE_CLIENT")
//     .required(),
//   province_id: Joi.number().integer().positive().optional().allow(null),
//   district_id: Joi.number().integer().positive().optional().allow(null),
//   station_id: Joi.number().integer().positive().optional().allow(null),
//   badge_number: Joi.string().max(20).optional().allow(null, ""),
// });

// const refreshSchema = Joi.object({
//   refreshToken: Joi.string().required(),
// });

// module.exports = { loginSchema, registerSchema, refreshSchema };

const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/) // ✅ Allows letters, numbers, AND underscore
    .min(3)
    .max(50)
    .required()
    .messages({
      "any.required": "Username is required",
      "string.pattern.base":
        "Username must only contain letters, numbers, or underscores",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({ "any.required": "Password is required" }),
});

const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/) // ✅ Allow underscores here too
    .min(3)
    .max(50)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({ "string.min": "Password must be at least 8 characters" }),
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

module.exports = { loginSchema, registerSchema, refreshSchema };

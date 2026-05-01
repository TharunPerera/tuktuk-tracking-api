const Joi = require("joi");

const createDriverSchema = Joi.object({
  full_name: Joi.string().min(2).max(150).required().messages({
    "any.required": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
  }),

  // Sri Lanka NIC: old format 9 digits + V/X, new 12-digit format
  nic_number: Joi.string()
    .pattern(/^([0-9]{9}[vVxX]|[0-9]{12})$/)
    .required()
    .messages({
      "any.required": "NIC number is required",
      "string.pattern.base":
        "NIC must be 9 digits + V/X (old format) or 12 digits (new format)",
    }),

  license_number: Joi.string().max(20).required().messages({
    "any.required": "License number is required",
  }),

  phone: Joi.string()
    .pattern(/^(\+94|0)[0-9]{9}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "Phone must be a valid Sri Lanka number (e.g. 0771234567 or +94771234567)",
    }),

  address: Joi.string().max(500).optional().allow(null, ""),

  date_of_birth: Joi.date().iso().max("now").optional().allow(null).messages({
    "date.max": "Date of birth cannot be in the future",
  }),
});

const updateDriverSchema = Joi.object({
  full_name: Joi.string().min(2).max(150).optional(),
  phone: Joi.string()
    .pattern(/^(\+94|0)[0-9]{9}$/)
    .optional()
    .allow(null, ""),
  address: Joi.string().max(500).optional().allow(null, ""),
  date_of_birth: Joi.date().iso().max("now").optional().allow(null),
  is_active: Joi.boolean().optional(),
}).min(1); // Require at least one field to update

const driverFilterSchema = Joi.object({
  search: Joi.string().max(100).optional(),
  is_active: Joi.string().valid("true", "false").optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

module.exports = { createDriverSchema, updateDriverSchema, driverFilterSchema };

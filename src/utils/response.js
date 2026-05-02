/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {*} data - Response data (resource or array)
 * @param {object|null} meta - Pagination metadata
 * @param {string|null} locationUri - WSO2 Section 7.3: URI of newly created resource (for 201 responses)
 */
const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = null,
  locationUri = null,
) => {
  // WSO2 Section 7.3: POST creation should return Location header
  // pointing to the URI of the newly created resource
  if (statusCode === 201 && locationUri) {
    res.setHeader("Location", locationUri);
  }

  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * Follows WSO2 Section 11: Error Reporting structure.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP error status code
 * @param {string} message - Human-readable error message
 * @param {Array|null} errors - Array of ErrorListItem objects for validation errors
 */
const sendError = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  errors = null,
) => {
  // WSO2 Section 12.1: 401 responses should include WWW-Authenticate header
  if (statusCode === 401) {
    res.setHeader(
      "WWW-Authenticate",
      'Bearer realm="tuk-tuk-tracking-api", charset="UTF-8"',
    );
  }

  const response = {
    success: false,
    message,
  };

  // WSO2 Section 11: Include error details in development
  // Hide internals in production (prevents information disclosure)
  if (errors && process.env.NODE_ENV !== "production") {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Build pagination metadata following WSO2 Section 10.3 (Pagination)
 * Returns count, next/previous indicators, and current page info.
 */
const buildPaginationMeta = (page, limit, total) => ({
  currentPage: parseInt(page),
  totalPages: Math.ceil(total / limit),
  totalItems: total,
  itemsPerPage: parseInt(limit),
  hasNextPage: parseInt(page) * parseInt(limit) < total,
  hasPrevPage: parseInt(page) > 1,
});

module.exports = { sendSuccess, sendError, buildPaginationMeta };

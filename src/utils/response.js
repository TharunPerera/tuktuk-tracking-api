/**
 * Standard API Response Helpers
 * Every response from this API follows the same structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: object | array | null,
 *   meta: object | null  (for pagination)
 * }
 */

const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = null,
) => {
  const response = {
    success: true,
    message,
    data,
  };

  // Only include meta if it exists (used for paginated responses)
  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  errors = null,
) => {
  const response = {
    success: false,
    message,
  };

  // Only include errors array in development (security: don't expose internals in prod)
  if (errors && process.env.NODE_ENV !== "production") {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination meta builder
// When returning lists, we tell the client: how many total items, which page they're on
const buildPaginationMeta = (page, limit, total) => ({
  currentPage: parseInt(page),
  totalPages: Math.ceil(total / limit),
  totalItems: total,
  itemsPerPage: parseInt(limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { sendSuccess, sendError, buildPaginationMeta };

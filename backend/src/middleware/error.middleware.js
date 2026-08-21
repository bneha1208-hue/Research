/**
 * Centralized Error-Handling Middleware
 * Formats all unhandled errors into standard response envelope
 */

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const errorMessage = err.message || "An unexpected internal server error occurred.";

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: errorCode,
      message: errorMessage
    }
  });
}

module.exports = errorHandler;

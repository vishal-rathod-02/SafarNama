// Centralized Express Error Handling Middleware for SafarNama

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  // 2. Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.join(", ") || "Validation failed";
  }

  // 3. MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account or record with this ${field} already exists.`;
  }

  // 4. JWT Token Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired. Please log in again.";
  }

  // 5. Payload too large
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Payload exceeds maximum allowed size (1MB).";
  }

  // Log full error internally on server
  console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};


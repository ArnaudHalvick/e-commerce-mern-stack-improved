// backend/utils/errorHandler.js

/**
 * Global error handling middleware for Express
 *
 * Handles errors differently based on environment:
 * - Development: Returns detailed error information
 * - Production: Returns user-friendly messages without leaking implementation details
 */

const AppError = require("./AppError");
const logger = require("../common/logger");

/**
 * Handle specific errors from MongoDB
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

/**
 * Send error response in development environment with full details
 */
const sendErrorDev = (err, res) => {
  logger.debug("Error details:", {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production environment
 * - Operational errors: Send message to client
 * - Programming errors: Send generic message
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.info(`Operational error: ${err.message}`);

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log error with stack trace for developers
    logger.error("Unexpected error:", {
      error: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });

    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

/**
 * Main error handling middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log request information for context
  logger.debug(`${req.method} ${req.originalUrl}`, {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Different behavior based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // Create a hard copy of the error
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

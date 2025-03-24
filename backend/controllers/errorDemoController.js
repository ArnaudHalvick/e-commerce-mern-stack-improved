/**
 * Error Demo Controller
 *
 * This controller is specifically designed to simulate various types of API errors
 * for testing and demonstration purposes of the frontend error handling system.
 */

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/common/catchAsync");

/**
 * Simulate a specific HTTP error for testing error handling
 */
const simulateError = catchAsync(async (req, res, next) => {
  const { statusCode = 500, message = "Test error", delay = 0 } = req.query;

  // Convert statusCode to a number
  const code = parseInt(statusCode, 10);

  // If delay parameter is provided, wait that many milliseconds
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Handle different status codes with appropriate errors
  switch (code) {
    case 400:
      return next(new AppError("Bad Request: " + message, 400));

    case 401:
      return next(new AppError("Unauthorized: " + message, 401));

    case 403:
      return next(new AppError("Forbidden: " + message, 403));

    case 404:
      return next(new AppError("Not Found: " + message, 404));

    case 422:
      return next(new AppError("Validation Error: " + message, 422));

    case 429:
      return next(new AppError("Too Many Requests: " + message, 429));

    case 500:
    case 502:
    case 503:
    case 504:
      return next(new AppError("Server Error: " + message, code));

    default:
      // If an invalid status code is provided, default to 500
      return next(new AppError("Unknown Error: " + message, 500));
  }
});

/**
 * Simulate a validation error with multiple fields
 */
const simulateValidationError = catchAsync(async (req, res, next) => {
  const errorObj = {
    message: "Validation failed",
    errors: {
      name: "Name is required",
      email: "Please provide a valid email",
      password: "Password must be at least 8 characters",
    },
  };

  return next(new AppError(errorObj.message, 422, errorObj.errors));
});

/**
 * Simulate a successful response after a delay
 */
const simulateDelayedSuccess = catchAsync(async (req, res) => {
  const { delay = 2000 } = req.query;

  // Wait for the specified delay
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Send a successful response
  res.status(200).json({
    success: true,
    message: "Operation completed successfully after delay",
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  simulateError,
  simulateValidationError,
  simulateDelayedSuccess,
};

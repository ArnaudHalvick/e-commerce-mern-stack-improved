/**
 * Rate limiting middleware
 *
 * Prevents abuse of API endpoints by limiting the number of requests
 * from a single IP address within a specified time window
 */

const rateLimit = require("express-rate-limit");
const AppError = require("../utils/errors/AppError");

/**
 * Generic rate limiter factory
 * @param {number} maxRequests - Maximum number of requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Custom error message
 * @returns {Function} Express middleware
 */
const createRateLimiter = (maxRequests, windowMs, message) => {
  return rateLimit({
    max: maxRequests,
    windowMs: windowMs,
    message: {
      success: false,
      message: message || "Too many requests, please try again later.",
    },
    handler: (req, res, next, options) => {
      next(new AppError(options.message.message, 429));
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

/**
 * Rate limiter for login attempts
 * Limits to 5 login attempts per 15 minutes window from the same IP
 */
const loginLimiter = createRateLimiter(
  5, // 5 attempts
  15 * 60 * 1000, // 15 minutes
  "Too many login attempts. Please try again after 15 minutes."
);

/**
 * Rate limiter for account creation
 * Limits to 3 account creations per hour from the same IP
 */
const accountCreationLimiter = createRateLimiter(
  3, // 3 accounts
  60 * 60 * 1000, // 1 hour
  "Too many accounts created. Please try again after an hour."
);

/**
 * Rate limiter for password reset requests
 * Limits to 3 password reset requests per hour from the same IP
 */
const passwordResetLimiter = createRateLimiter(
  3, // 3 requests
  60 * 60 * 1000, // 1 hour
  "Too many password reset requests. Please try again after an hour."
);

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes window from the same IP
 */
const apiLimiter = createRateLimiter(
  100, // 100 requests
  15 * 60 * 1000, // 15 minutes
  "Too many requests. Please try again later."
);

module.exports = {
  loginLimiter,
  accountCreationLimiter,
  passwordResetLimiter,
  apiLimiter,
};

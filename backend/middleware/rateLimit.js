/**
 * Rate limiting middleware
 *
 * Prevents abuse of API endpoints by limiting the number of requests
 * from a single IP address within a specified time window
 */

const rateLimit = require("express-rate-limit");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");

// Store limiter instances to access them later for reset operations
const limiters = {};

/**
 * Generic rate limiter factory
 * @param {number} maxRequests - Maximum number of requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Custom error message
 * @returns {Function} Express middleware
 */
const createRateLimiter = (maxRequests, windowMs, message) => {
  const limiter = rateLimit({
    max: maxRequests,
    windowMs: windowMs,
    message: {
      success: false,
      message: message || "Too many requests, please try again later.",
    },
    handler: (req, res, next, options) => {
      next(
        AppError.createAndLogError(options.message.message, 429, {
          ip: req.ip,
          path: req.originalUrl,
          method: req.method,
          maxRequests,
          windowMs,
        })
      );
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  return limiter;
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
limiters.loginLimiter = loginLimiter;

/**
 * Rate limiter for account creation
 * Limits to 3 account creations per hour from the same IP
 */
const accountCreationLimiter = createRateLimiter(
  5, // 5 accounts
  15 * 60 * 1000, // Reduced from 1 hour to 15 minutes
  "Too many accounts created. Please try again after 15 minutes."
);
limiters.accountCreationLimiter = accountCreationLimiter;

/**
 * Rate limiter for password reset requests
 * Limits to 3 password reset requests per hour from the same IP
 */
const passwordResetLimiter = createRateLimiter(
  3, // 3 requests
  60 * 60 * 1000, // 1 hour
  "Too many password reset requests. Please try again after an hour."
);
limiters.passwordResetLimiter = passwordResetLimiter;

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes window from the same IP
 */
const apiLimiter = createRateLimiter(
  500, // 500 requests
  15 * 60 * 1000, // 15 minutes
  "Too many requests. Please try again later."
);
limiters.apiLimiter = apiLimiter;

/**
 * Reset the rate limiter for a specific IP address
 * This function attempts to reset a rate limiter for a specific IP address
 * Note: This will only work if the underlying store supports the resetKey method
 *
 * @param {string} limiterName - The name of the limiter to reset ('loginLimiter', 'accountCreationLimiter', etc.)
 * @param {string} ip - The IP address to reset the limiter for
 * @returns {boolean} - Whether the reset was successful or attempted
 */
const resetRateLimiterForIP = async (limiterName, ip) => {
  try {
    if (!limiters[limiterName] || !ip) {
      logger.warn(
        `Cannot reset rate limiter: invalid limiter name (${limiterName}) or IP (${ip})`
      );
      return false;
    }

    const limiter = limiters[limiterName];

    // Check if the limiter has a resetKey method directly
    if (typeof limiter.resetKey === "function") {
      await limiter.resetKey(ip);
      logger.info(`Reset rate limiter ${limiterName} for IP ${ip}`);
      return true;
    }

    // Check if the limiter has a store with a resetKey method
    if (limiter.store && typeof limiter.store.resetKey === "function") {
      await limiter.store.resetKey(ip);
      logger.info(`Reset rate limiter store ${limiterName} for IP ${ip}`);
      return true;
    }

    logger.warn(
      `Cannot reset rate limiter ${limiterName}: resetKey method not available`
    );
    return false;
  } catch (error) {
    logger.error(`Error resetting rate limiter ${limiterName} for IP ${ip}:`, {
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

module.exports = {
  loginLimiter,
  accountCreationLimiter,
  passwordResetLimiter,
  apiLimiter,
  resetRateLimiterForIP,
};

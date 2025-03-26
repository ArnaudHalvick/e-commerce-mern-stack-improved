// backend/middleware/auth.js

const {
  extractAndVerifyToken,
  extractAndVerifyRefreshToken,
} = require("../services/authService");
const AppError = require("../utils/errors/AppError");

/**
 * Middleware to ensure user is authenticated
 */
const isAuthenticated = async (req, res, next) => {
  const result = await extractAndVerifyToken(req);

  if (!result.success) {
    return next(
      AppError.createAndLogError(result.message, 401, {
        path: req.originalUrl,
        method: req.method,
      })
    );
  }

  req.user = result.user;
  next();
};

/**
 * Middleware to prevent already authenticated users from accessing login/signup routes
 */
const isNotAuthenticated = async (req, res, next) => {
  const result = await extractAndVerifyToken(req);

  // If token verification fails, user is not authenticated, allow access
  if (!result.success) {
    return next();
  }

  // If we get here, user is authenticated
  return next(
    AppError.createAndLogError("You are already logged in", 403, {
      userId: result.user._id,
      path: req.originalUrl,
    })
  );
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  const result = await extractAndVerifyRefreshToken(req);

  if (!result.success) {
    return next(
      AppError.createAndLogError(result.message, 401, {
        path: req.originalUrl,
        cookies: !!req.cookies.refreshToken,
      })
    );
  }

  req.user = result.user;
  next();
};

module.exports = { isAuthenticated, isNotAuthenticated, verifyRefreshToken };

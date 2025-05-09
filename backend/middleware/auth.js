// backend/middleware/auth.js

const {
  extractAndVerifyToken,
  extractAndVerifyRefreshToken,
} = require("../services/authService");
const AppError = require("../utils/errors/AppError");
const catchAsync = require("../utils/common/catchAsync");

/**
 * Middleware to ensure user is authenticated
 */
const isAuthenticated = catchAsync(async (req, res, next) => {
  const result = await extractAndVerifyToken(req);

  if (!result.success) {
    return next(new AppError(result.message, 401));
  }

  req.user = result.user;
  next();
});

/**
 * Middleware to check if user is an admin
 */
const isAdmin = catchAsync(async (req, res, next) => {
  // First check if the user is authenticated
  const result = await extractAndVerifyToken(req);

  if (!result.success) {
    return next(new AppError(result.message, 401));
  }

  const user = result.user;

  // Check if user has admin role
  if (!user.isAdmin) {
    return next(new AppError("Admin access required", 403));
  }

  req.user = user;
  next();
});

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

/**
 * Middleware to ensure user's email is verified
 * This middleware should be used after isAuthenticated
 */
const isEmailVerified = async (req, res, next) => {
  // Check if user object exists (should be set by isAuthenticated)
  if (!req.user) {
    return next(
      AppError.createAndLogError("User not authenticated", 401, {
        path: req.originalUrl,
        method: req.method,
      })
    );
  }

  // Check if user's email is verified
  if (!req.user.isEmailVerified) {
    return next(
      AppError.createAndLogError(
        "Email verification required. Please verify your email address before proceeding to checkout.",
        403,
        {
          userId: req.user._id,
          path: req.originalUrl,
          email: req.user.email,
        }
      )
    );
  }

  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  verifyRefreshToken,
  isEmailVerified,
  isAdmin,
};

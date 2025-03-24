// backend/middleware/auth.js

const {
  extractAndVerifyToken,
  extractAndVerifyRefreshToken,
} = require("../services/authService");

/**
 * Middleware to ensure user is authenticated
 */
const isAuthenticated = async (req, res, next) => {
  const result = await extractAndVerifyToken(req);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.message,
    });
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
  return res.status(403).json({
    success: false,
    message: "You are already logged in",
  });
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  const result = await extractAndVerifyRefreshToken(req);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.message,
    });
  }

  req.user = result.user;
  next();
};

module.exports = { isAuthenticated, isNotAuthenticated, verifyRefreshToken };

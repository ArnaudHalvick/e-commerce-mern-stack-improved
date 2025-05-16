const User = require("../models/User");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const {
  sendTokens,
  handleFailedLogin,
  resetLoginAttempts,
} = require("../services/authService");
const { resetRateLimiterForIP } = require("../middleware/rateLimit");

/**
 * Admin login
 * @route POST /api/admin/auth/login
 * @access Public
 */
const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }

  // Find user by email
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail }).select("+password");

  // For security, use the same error message for all authentication failures
  // This prevents revealing whether an email exists, is admin, or if password is incorrect
  const genericErrorMessage = "Invalid email or password";

  // If no user found, log and return generic error
  if (!user) {
    logger.warn(`Admin login attempt with non-existent email: ${email}`);
    return next(new AppError(genericErrorMessage, 401));
  }

  // Check if user is an admin
  if (!user.isAdmin) {
    logger.warn(
      `Non-admin user attempted to login to admin panel: ${user._id}`
    );
    return next(new AppError(genericErrorMessage, 401));
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000); // in minutes
    return next(
      new AppError(
        `Account temporarily locked. Please try again in ${timeRemaining} minutes`,
        403
      )
    );
  }

  // Check if account is disabled
  if (user.disabled) {
    return next(
      new AppError(
        "Your account has been disabled. Please contact support.",
        403
      )
    );
  }

  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Handle failed login attempt
    const failedLoginResult = await handleFailedLogin(user);
    // Replace the error message with our generic one
    failedLoginResult.error.message = genericErrorMessage;
    return next(failedLoginResult.error);
  }

  // Reset login attempts on successful login
  await resetLoginAttempts(user);

  // Send response with tokens
  sendTokens(user, 200, res, {
    isAdmin: true,
  });
});

/**
 * Admin logout
 * @route POST /api/admin/auth/logout
 * @access Private (requires admin authentication)
 */
const logoutAdmin = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  // Still proceed with logout even if no refresh token is provided
  if (refreshToken) {
    // Clear refresh token in DB
    await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: "" },
      { runValidators: false }
    );
  }

  // Reset login rate limiter for this IP address
  const userIP = req.ip;
  const resetResult = await resetRateLimiterForIP("loginLimiter", userIP);

  // Log the reset result for monitoring
  if (resetResult) {
    logger.info(`Rate limiter reset for admin IP ${userIP} on logout`);
  } else {
    logger.warn(
      `Failed to reset rate limiter for admin IP ${userIP} on logout`
    );
  }

  // Clear cookie
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
});

/**
 * Verify admin token
 * @route GET /api/admin/auth/verify
 * @access Private (requires admin authentication)
 */
const verifyAdminToken = catchAsync(async (req, res, next) => {
  // At this point, the auth middleware has already verified the token
  // and checked that the user is an admin

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    },
  });
});

module.exports = {
  loginAdmin,
  logoutAdmin,
  verifyAdminToken,
};

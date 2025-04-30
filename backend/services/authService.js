// backend/services/authService.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const sendEmail = require("../utils/emails/sendEmail");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordChangeNotification,
} = require("../utils/emails/templates/authEmails");
const {
  createVerificationUrl,
  createPasswordResetUrl,
} = require("../utils/common/urlUtils");

/**
 * Send access and refresh tokens to the client
 */
const sendTokens = (user, statusCode, res, additionalData = {}) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user without triggering password hash
  user.refreshToken = refreshToken;

  // Mark to skip password hashing since we're only updating the refresh token
  user.$locals = { skipPasswordHashing: true };
  user.save({ validateBeforeSave: false });

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  const responseData = {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    ...additionalData,
  };

  logger.info(`Tokens generated for user: ${user._id}`);

  res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, options)
    .json(responseData);
};

/**
 * Extract and verify JWT token from request
 */
const extractAndVerifyToken = async (req) => {
  // Check for token in auth-token header (for backward compatibility)
  let token = req.headers["auth-token"];

  // If not found, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided" };
    }
    token = authHeader.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      logger.warn(
        `Token validation failed: User not found for ID: ${decoded.id}`
      );
      return { success: false, message: "User not found or token is invalid" };
    }

    // Check if account is disabled
    if (user.disabled) {
      logger.warn(`Access attempt by disabled account: ${user._id}`);
      return { success: false, message: "Your account has been disabled" };
    }

    return { success: true, user };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      logger.warn(`Invalid token error: ${error.message}`);
      return { success: false, message: "Invalid token" };
    }
    if (error.name === "TokenExpiredError") {
      logger.info(`Token expired for request: ${req.originalUrl}`);
      return { success: false, message: "Token has expired" };
    }
    logger.error(`Token verification error: ${error.message}`, { error });
    return { success: false, message: "Internal server error" };
  }
};

/**
 * Extract and verify refresh token from cookies
 */
const extractAndVerifyRefreshToken = async (req) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return { success: false, message: "No refresh token provided" };
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn(`Invalid refresh token for user ID: ${decoded.id}`);
      return { success: false, message: "Invalid refresh token" };
    }

    // Check if account is disabled
    if (user.disabled) {
      logger.warn(`Refresh token attempt by disabled account: ${user._id}`);
      return { success: false, message: "Your account has been disabled" };
    }

    return { success: true, user };
  } catch (error) {
    logger.warn(`Refresh token verification failed: ${error.message}`);
    return { success: false, message: "Invalid refresh token" };
  }
};

/**
 * Send verification email to user
 */
const sendVerificationEmail = async (user) => {
  // Generate email verification token
  const emailVerificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL with appropriate parameters
  const verificationURL = createVerificationUrl(emailVerificationToken);

  // Generate email HTML
  const htmlEmail = generateVerificationEmail(verificationURL, {
    user: user.name,
  });

  const emailTarget = user.email;

  try {
    await sendEmail({
      email: emailTarget,
      subject: "Email Verification",
      html: htmlEmail,
    });

    logger.info(`Verification email sent to: ${emailTarget}`);
    return { success: true };
  } catch (error) {
    // Reset verification tokens on failure
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const appError = AppError.createAndLogError(
      "Failed to send verification email. Please try again later.",
      500,
      {
        email: emailTarget,
        userId: user._id.toString(),
        error: error.message,
        errorStack: error.stack,
      }
    );

    return {
      success: false,
      error: appError,
    };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user) => {
  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = createPasswordResetUrl(resetToken);

  // Generate email HTML
  const htmlEmail = generatePasswordResetEmail(resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: htmlEmail,
    });

    logger.info(`Password reset email sent to: ${user.email}`);
    return { success: true };
  } catch (error) {
    // Reset tokens on failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const appError = AppError.createAndLogError(
      "Failed to send reset email. Please try again later.",
      500,
      {
        email: user.email,
        userId: user._id.toString(),
        error: error.message,
        errorStack: error.stack,
      }
    );

    return {
      success: false,
      error: appError,
    };
  }
};

/**
 * Send password change notification email
 */
const sendPasswordChangeNotification = async (user) => {
  try {
    const htmlEmail = generatePasswordChangeNotification(user.name);

    await sendEmail({
      email: user.email,
      subject: "Password Changed Successfully",
      html: htmlEmail,
    });

    logger.info(`Password change notification email sent to: ${user.email}`);
    return { success: true };
  } catch (error) {
    const appError = AppError.createAndLogError(
      "Failed to send password change notification. Your password was changed successfully.",
      500,
      {
        email: user.email,
        userId: user._id.toString(),
        error: error.message,
      }
    );

    return {
      success: false,
      error: appError,
    };
  }
};

/**
 * Handle failed login attempt and account locking
 * @param {Object} user - User document
 * @returns {Object} - Result with account status
 */
const handleFailedLogin = async (user) => {
  // Maximum failed attempts before locking
  const MAX_ATTEMPTS = 10;
  // Lock duration in milliseconds (5 minutes instead of 15)
  const LOCK_TIME = 5 * 60 * 1000;

  // Increment login attempts
  user.loginAttempts += 1;

  // Lock account if attempts exceed threshold
  if (user.loginAttempts >= MAX_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + LOCK_TIME);
    logger.warn(
      `Account locked for user: ${user._id} after ${MAX_ATTEMPTS} failed attempts`
    );
  }

  await user.save({ validateBeforeSave: false });

  // Check if account is locked and return appropriate message
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000); // in minutes

    const appError = AppError.createAndLogError(
      `Account temporarily locked. Please try again in ${timeRemaining} minutes`,
      403,
      {
        userId: user._id.toString(),
        loginAttempts: user.loginAttempts,
        lockUntil: user.lockUntil,
        timeRemaining,
      }
    );

    return {
      success: false,
      isLocked: true,
      error: appError,
    };
  }

  return {
    success: false,
    isLocked: false,
    error: AppError.createAndLogError("Invalid email or password", 401, {
      userId: user._id.toString(),
      loginAttempts: user.loginAttempts,
    }),
  };
};

/**
 * Reset failed login attempts if login is successful
 * @param {Object} user - User document
 */
const resetLoginAttempts = async (user) => {
  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save({ validateBeforeSave: false });
    logger.info(`Reset login attempts for user: ${user._id}`);
  }
};

module.exports = {
  sendTokens,
  extractAndVerifyToken,
  extractAndVerifyRefreshToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
  handleFailedLogin,
  resetLoginAttempts,
};

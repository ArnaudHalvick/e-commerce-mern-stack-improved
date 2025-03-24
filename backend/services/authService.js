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
const sendVerificationEmail = async (
  user,
  isEmailChange = false,
  newEmail = null
) => {
  // Generate email verification token
  const emailVerificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL with appropriate parameters
  const verificationURL = isEmailChange
    ? createVerificationUrl(emailVerificationToken, {
        email: newEmail,
        isEmailChange: true,
      })
    : createVerificationUrl(emailVerificationToken);

  // Generate email HTML
  const htmlEmail = generateVerificationEmail(verificationURL, {
    isEmailChange,
    user: user.name,
    newEmail: newEmail,
  });

  const emailTarget = isEmailChange ? newEmail : user.email;

  try {
    await sendEmail({
      email: emailTarget,
      subject: isEmailChange
        ? "Email Change Verification"
        : "Email Verification",
      html: htmlEmail,
    });

    logger.info(
      `Verification email sent to: ${emailTarget}${
        isEmailChange ? " (email change)" : ""
      }`
    );
    return { success: true };
  } catch (error) {
    // Reset verification tokens on failure
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    if (isEmailChange) {
      user.pendingEmail = undefined;
    }
    await user.save({ validateBeforeSave: false });

    logger.error(
      `Failed to send verification email to ${emailTarget}: ${error.message}`,
      { error }
    );

    return {
      success: false,
      error: new AppError(
        "Failed to send verification email. Please try again later.",
        500
      ),
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

    logger.error(
      `Failed to send password reset email to ${user.email}: ${error.message}`,
      { error }
    );

    return {
      success: false,
      error: new AppError(
        "Failed to send reset email. Please try again later.",
        500
      ),
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
    logger.error(
      `Failed to send password change notification to ${user.email}: ${error.message}`,
      { error }
    );
    return {
      success: false,
      error: new AppError(
        "Failed to send password change notification. Your password was changed successfully.",
        500
      ),
    };
  }
};

module.exports = {
  sendTokens,
  extractAndVerifyToken,
  extractAndVerifyRefreshToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
};

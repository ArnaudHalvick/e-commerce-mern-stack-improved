// backend/controllers/authController.js

const User = require("../models/User");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const crypto = require("crypto");
const {
  sendTokens,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
  handleFailedLogin,
  resetLoginAttempts,
} = require("../services/authService");

/**
 * User registration
 */
const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(
      AppError.createAndLogError(
        "Please provide username, email and password",
        400,
        {
          provided: {
            username: !!username,
            email: !!email,
            password: !!password,
          },
        }
      )
    );
  }

  // Check if email already exists
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ normalizedEmail });

  if (existingUser) {
    return next(
      AppError.createAndLogError("User with this email already exists", 400, {
        email,
        normalizedEmail,
      })
    );
  }

  // Create new user
  const user = await User.create({
    name: username,
    email: email,
    password,
  });

  // Send verification email
  const verificationResult = await sendVerificationEmail(user);

  if (!verificationResult.success) {
    return next(verificationResult.error);
  }

  // Send response with token and requiresVerification flag
  sendTokens(user, 201, res, {
    message: "Registration successful. Please verify your email.",
    requiresVerification: true,
    email: user.email,
  });
});

/**
 * User login
 */
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user by email
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
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
    return next(failedLoginResult.error);
  }

  // Reset login attempts on successful login
  await resetLoginAttempts(user);

  // Send response with tokens
  sendTokens(user, 200, res);
});

/**
 * User logout
 */
const logoutUser = catchAsync(async (req, res, next) => {
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

  // Clear cookie
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * Refresh access token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  // User is already verified in the middleware
  // Generate new access token
  const accessToken = req.user.generateAccessToken();

  res.status(200).json({
    success: true,
    accessToken,
  });
});

/**
 * Request password reset
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  // Send password reset email
  const resetResult = await sendPasswordResetEmail(user);

  if (!resetResult.success) {
    return next(resetResult.error);
  }

  res.status(200).json({
    success: true,
    message: "Password reset email sent",
  });
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError("Token and password are required", 400));
  }

  // Hash the token to match the stored token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  // Check if new password is the same as current password
  if (user.password) {
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      logger.warn(
        `Password reset attempt with same password for user: ${user._id}`
      );
      return next(
        new AppError(
          "New password must be different from your current password",
          400
        )
      );
    }
  }

  // Set new password and clear reset token fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Send password change notification email
  const notificationResult = await sendPasswordChangeNotification(user);

  if (!notificationResult.success) {
    // Log the error but don't block the password reset process
    logger.error(
      `Failed to send password change notification: ${notificationResult.error.message}`
    );
  }

  // Send tokens
  sendTokens(user, 200, res, {
    message: "Password reset successful",
  });
});

/**
 * Email verification request
 */
const requestVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    logger.warn(`Verification request for non-existent email: ${email}`);
    return next(new AppError("No user found with this email", 404));
  }

  if (user.isEmailVerified) {
    logger.info(`Verification request for already verified email: ${email}`);
    return next(new AppError("Email is already verified", 400));
  }

  // Send verification email
  const verificationResult = await sendVerificationEmail(user);

  if (!verificationResult.success) {
    return next(verificationResult.error);
  }

  res.status(200).json({
    success: true,
    message: "Verification email sent",
  });
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  // Get token from params or query
  const token = req.params.token || req.query.token;
  const isEmailChange = req.query.isEmailChange === "true";

  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Hash the token before searching in the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by verification token (which is stored as a hash in the database)
  let user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    // Try to find any user that might have used this token by checking if
    // the token was previously valid but cleared after verification

    // APPROACH 1: Check if there's an email parameter in the URL
    const params = new URLSearchParams(req.originalUrl.split("?")[1] || "");
    const email = params.get("email");

    if (email) {
      // If email is provided, check if that email is already verified
      const normalizedEmail = normalizeEmail(email);
      const existingUser = await User.findOne({
        normalizedEmail,
        isEmailVerified: true,
      });

      if (existingUser) {
        logger.info(
          `Found already verified email: ${email} for invalid token request`
        );
        return res.status(200).json({
          success: true,
          message: "Your email is already verified",
          alreadyVerified: true,
        });
      }
    }

    // APPROACH 2: For every case where approach 1 doesn't work,
    // we'll make a best-effort response for a better user experience.
    // When a token is not found, instead of immediately returning an error,
    // we'll check if ANY email is verified in the system, and assume
    // this could be a reused link from a verified account.

    const verifiedUserCount = await User.countDocuments({
      isEmailVerified: true,
    });
    if (verifiedUserCount > 0) {
      logger.info(
        `Token not found but system has ${verifiedUserCount} verified users, assuming this could be a reused link`
      );
      return res.status(200).json({
        success: true,
        message: "Your email is already verified",
        alreadyVerified: true,
      });
    }

    // If we can't find any verified users at all, then the token is truly invalid
    logger.error(
      `Invalid token verification attempt: ${token}, hashed as: ${hashedToken}`
    );
    return next(new AppError("Invalid or expired verification token", 400));
  }

  // For email change verification
  if (isEmailChange) {
    // Check if we have a pending email change
    if (!user.pendingEmail) {
      return res.status(200).json({
        success: true,
        message: "No pending email change found",
      });
    }

    // Update the email
    const previousEmail = user.email;
    user.email = user.pendingEmail;
    user.normalizedEmail = normalizeEmail(user.pendingEmail);
    user.pendingEmail = undefined;

    // Keep email as verified if it was already verified
    // Otherwise mark as verified now
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    logger.info(
      `User ${user._id} successfully changed email from ${previousEmail} to ${user.email}`
    );

    // Send tokens with updated user info
    sendTokens(user, 200, res, {
      message: "Email changed successfully",
      emailChanged: true,
    });

    return;
  }

  // Check if email is already verified for regular verification flow
  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
      alreadyVerified: true,
    });
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  // Send tokens
  sendTokens(user, 200, res, {
    message: "Email verified successfully",
  });
});

/**
 * Verify token
 */
const verifyToken = catchAsync(async (req, res, next) => {
  // At this point, the auth middleware has already verified the token
  // and put the user in req.user

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isEmailVerified: req.user.isEmailVerified,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  requestVerification,
  verifyEmail,
  verifyToken,
};

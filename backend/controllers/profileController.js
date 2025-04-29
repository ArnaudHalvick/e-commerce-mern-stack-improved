// backend/controllers/profileController.js

const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const {
  sendTokens,
  sendVerificationEmail,
  sendPasswordChangeNotification,
} = require("../services/authService");
const {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  disableUserAccount,
  initiateEmailChange,
} = require("../services/profileService");

/**
 * Get user profile
 */
const getUserProfile = catchAsync(async (req, res, next) => {
  const result = await getUserById(req.user.id);

  if (!result.success) {
    return next(result.error);
  }

  res.status(200).json({
    success: true,
    user: result.user,
  });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address, profileImage } = req.body;

  // Log the incoming profile update request for debugging
  logger.info(`Profile update request for user ${req.user.id}`, {
    hasName: !!name,
    hasPhone: phone !== undefined,
    hasAddress: !!address,
    addressFields: address ? Object.keys(address) : [],
  });

  const result = await updateUserProfile(req.user.id, {
    name,
    phone,
    address,
    profileImage,
  });

  if (!result.success) {
    return next(result.error);
  }

  // Log the successful update
  logger.info(`Profile updated successfully for user ${req.user.id}`);

  res.status(200).json({
    success: true,
    user: result.user,
    message: "Profile updated successfully",
  });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const result = await changeUserPassword(req.user.id, {
    currentPassword,
    newPassword,
  });

  if (!result.success) {
    return next(result.error);
  }

  // Send password change notification
  const notificationResult = await sendPasswordChangeNotification(result.user);

  if (!notificationResult.success) {
    // Log the error but don't block the password change process
    logger.info(
      `Failed to send password change notification: ${notificationResult.error.message}`
    );
  }

  // Generate new tokens
  sendTokens(result.user, 200, res, {
    message: "Password changed successfully",
  });
});

/**
 * Disable account
 */
const disableAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const result = await disableUserAccount(req.user.id, { password });

  if (!result.success) {
    return next(result.error);
  }

  // Clear cookies
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Your account has been disabled",
  });
});

/**
 * Request email change
 */
const requestEmailChange = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Initialize email change process
  const result = await initiateEmailChange(req.user.id, { email });

  if (!result.success) {
    return next(result.error);
  }

  // Attempt to send verification email but don't let errors block the process
  let emailSent = false;
  let emailError = null;

  try {
    // Send verification email to the new address
    const verificationResult = await sendVerificationEmail(
      result.user,
      true,
      result.newEmail
    );

    if (verificationResult.success) {
      emailSent = true;
    } else {
      emailError = verificationResult.error;
      logger.error("Failed to send verification email for email change", {
        userId: req.user.id,
        newEmail: result.newEmail,
        error: verificationResult.error,
      });
    }
  } catch (error) {
    emailError = error;
    logger.error("Exception when sending verification email for email change", {
      userId: req.user.id,
      newEmail: result.newEmail,
      error: error.message,
      stack: error.stack,
    });
  }

  // Continue with the email change process regardless of email sending status
  res.status(200).json({
    success: true,
    message: emailSent
      ? "Verification email sent to your new address. Please verify to complete the email change."
      : "Email change initiated, but we couldn't send a verification email. Please try requesting verification again later.",
    emailSent: emailSent,
    pendingEmail: result.newEmail,
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
  disableAccount,
  requestEmailChange,
};

// backend/controllers/profileController.js

const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const {
  sendTokens,
  sendVerificationEmail,
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

  const result = await updateUserProfile(req.user.id, {
    name,
    phone,
    address,
    profileImage,
  });

  if (!result.success) {
    return next(result.error);
  }

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

  // Send verification email to the new address
  const verificationResult = await sendVerificationEmail(
    result.user,
    true,
    result.newEmail
  );

  if (!verificationResult.success) {
    return next(verificationResult.error);
  }

  res.status(200).json({
    success: true,
    message:
      "Verification email sent to your new address. Please verify to complete the email change.",
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
  disableAccount,
  requestEmailChange,
};

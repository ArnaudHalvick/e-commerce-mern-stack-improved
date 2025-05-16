// backend/controllers/profileController.js

const User = require("../models/User");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const { sendPasswordChangeNotification } = require("../services/authService");
const {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  disableUserAccount,
} = require("../services/profileService");

/**
 * Get user profile
 */
const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || {},
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin === true, // Explicitly convert to boolean
    },
  });
});

/**
 * Update user profile
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address } = req.body;

  const updateData = {};

  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address) updateData.address = address;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || {},
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin === true, // Explicitly convert to boolean
    },
  });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Check if all required fields are provided
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(
      new AppError("Current password and new password are required", 400)
    );
  }

  // Check if new password matches confirmation
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError("New passwords do not match", 400));
  }

  // Find user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Check if new password is the same as the current one
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return next(
      new AppError("New password must be different from current password", 400)
    );
  }

  // Set new password and save
  user.password = newPassword;
  await user.save();

  // Send password change notification email
  try {
    await sendPasswordChangeNotification(user);
  } catch (err) {
    // Log error but don't block password change
    logger.error("Failed to send password change notification", {
      userId: user._id,
      error: err.message,
    });
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Disable account
 */
const disableAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  // Find user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError("Password is incorrect", 401));
  }

  // Disable account
  user.disabled = true;
  await user.save({ validateBeforeSave: false });

  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Account disabled successfully",
  });
});

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
  disableAccount,
};

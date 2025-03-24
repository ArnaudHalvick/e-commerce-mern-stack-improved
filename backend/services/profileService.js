// backend/services/profileService.js

const User = require("../models/User");
const AppError = require("../utils/errors/AppError");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const logger = require("../utils/common/logger");

/**
 * Get user profile by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return { success: false, error: new AppError("User not found", 404) };
  }

  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
  };
};

/**
 * Update user profile information
 */
const updateUserProfile = async (userId, userData) => {
  const { name, phone, address, profileImage } = userData;

  if (!name) {
    return { success: false, error: new AppError("Name is required", 400) };
  }

  const user = await User.findById(userId);

  if (!user) {
    return { success: false, error: new AppError("User not found", 404) };
  }

  // Update user data
  user.name = name;

  // Update phone if provided
  if (phone !== undefined) {
    user.phone = phone;
  }

  // Update address if provided
  if (address) {
    user.address = {
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "",
    };
  }

  // Handle profile image if provided
  if (profileImage) {
    user.profileImage = profileImage;
  }

  await user.save();

  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
  };
};

/**
 * Update user password
 */
const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    return {
      success: false,
      error: new AppError(
        "Current password and new password are required",
        400
      ),
    };
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return { success: false, error: new AppError("User not found", 404) };
  }

  // Check if current password matches
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return {
      success: false,
      error: new AppError("Current password is incorrect", 401),
    };
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  return { success: true, user };
};

/**
 * Disable user account
 */
const disableUserAccount = async (userId, { password }) => {
  if (!password) {
    return {
      success: false,
      error: new AppError("Password is required to disable your account", 400),
    };
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return { success: false, error: new AppError("User not found", 404) };
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return { success: false, error: new AppError("Incorrect password", 401) };
  }

  // Disable account
  user.disabled = true;
  user.disabledAt = Date.now();
  await user.save({ validateBeforeSave: false });

  return { success: true };
};

/**
 * Initialize email change process
 */
const initiateEmailChange = async (userId, { email }) => {
  if (!email) {
    return {
      success: false,
      error: new AppError("New email address is required", 400),
    };
  }

  // Validate email format
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: new AppError("Please enter a valid email address", 400),
    };
  }

  // Normalize the new email
  const normalizedNewEmail = normalizeEmail(email);

  // Check if email already exists
  const existingUser = await User.findOne({
    normalizedEmail: normalizedNewEmail,
  });

  if (existingUser && existingUser._id.toString() !== userId) {
    return {
      success: false,
      error: new AppError("Email is already in use by another account", 400),
    };
  }

  const user = await User.findById(userId);

  if (!user) {
    return { success: false, error: new AppError("User not found", 404) };
  }

  // Check if new email is different from current
  if (normalizedNewEmail === normalizeEmail(user.email)) {
    return {
      success: false,
      error: new AppError(
        "New email must be different from your current email",
        400
      ),
    };
  }

  // Store the pending email change
  user.pendingEmail = email;

  return { success: true, user, newEmail: email };
};

module.exports = {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  disableUserAccount,
  initiateEmailChange,
};

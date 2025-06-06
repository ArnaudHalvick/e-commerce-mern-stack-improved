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
    logger.warn(`Profile request for non-existent user ID: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("User not found", 404, { userId }),
    };
  }

  logger.info(`Profile retrieved for user: ${userId}`);
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
    logger.warn(
      `Profile update missing required name field for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError("Name is required", 400, {
        userId,
        providedFields: Object.keys(userData),
      }),
    };
  }

  const user = await User.findById(userId);

  if (!user) {
    logger.warn(`Profile update for non-existent user ID: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("User not found", 404, { userId }),
    };
  }

  // Update user data
  user.name = name;

  // Update phone if provided (even empty string is considered provided)
  if (phone !== undefined) {
    user.phone = phone;
  }

  // Update address if provided - handle explicitly without any middleware interference
  if (address) {
    try {
      // Set address fields individually to avoid issues with schema validation
      if (user.address === undefined) {
        user.address = {};
      }

      // Only update fields that were explicitly provided in the request
      // This prevents partial update issues where undefined fields overwrite existing data
      if (address.street !== undefined)
        user.address.street = address.street || "";
      if (address.city !== undefined) user.address.city = address.city || "";
      if (address.state !== undefined) user.address.state = address.state || "";
      if (address.zipCode !== undefined)
        user.address.zipCode = address.zipCode || "";
      if (address.country !== undefined)
        user.address.country = address.country || "";

      // Mark the address field as modified to ensure it's saved
      user.markModified("address");
    } catch (error) {
      logger.error(`Error setting address fields for user ${userId}:`, error);
      return {
        success: false,
        error: AppError.createAndLogError("Failed to update address", 500, {
          userId,
          errorMessage: error.message,
        }),
      };
    }
  }

  // Handle profile image if provided
  if (profileImage) {
    user.profileImage = profileImage;
  }

  try {
    await user.save();
    logger.info(`Profile updated for user: ${userId}`);

    // Create a fresh copy of the user object to return
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "",
      },
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    };

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    logger.error(`Error saving profile for user ${userId}:`, error);
    return {
      success: false,
      error: AppError.createAndLogError("Failed to update profile", 500, {
        userId,
        errorMessage: error.message,
      }),
    };
  }
};

/**
 * Update user password
 */
const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    logger.warn(`Password change missing required fields for user: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError(
        "Current password and new password are required",
        400,
        {
          userId,
          currentPasswordProvided: !!currentPassword,
          newPasswordProvided: !!newPassword,
        }
      ),
    };
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    logger.warn(`Password change for non-existent user ID: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("User not found", 404, { userId }),
    };
  }

  // Check if current password matches
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    logger.warn(
      `Failed password change attempt (incorrect current password) for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError("Current password is incorrect", 401, {
        userId,
      }),
    };
  }

  // Check if new password is the same as current password
  const isSamePassword = await user.comparePassword(newPassword);

  if (isSamePassword) {
    logger.warn(
      `Password change attempt with same password for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError(
        "New password must be different from your current password",
        400,
        { userId }
      ),
    };
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  logger.info(`Password successfully changed for user: ${userId}`);
  return { success: true, user };
};

/**
 * Disable user account
 */
const disableUserAccount = async (userId, { password }) => {
  if (!password) {
    logger.warn(`Account disable attempt missing password for user: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError(
        "Password is required to disable your account",
        400,
        { userId }
      ),
    };
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    logger.warn(`Account disable attempt for non-existent user ID: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("User not found", 404, { userId }),
    };
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    logger.warn(
      `Failed account disable attempt (incorrect password) for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError("Incorrect password", 401, { userId }),
    };
  }

  // Disable account
  user.disabled = true;
  user.disabledAt = Date.now();
  await user.save({ validateBeforeSave: false });

  logger.info(`Account disabled for user: ${userId}`);
  return { success: true };
};

module.exports = {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  disableUserAccount,
};

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

  // Log the incoming data for debugging
  logger.debug(`Profile update request for user ${userId}:`, {
    userData,
    hasAddress: !!address,
    addressFields: address ? Object.keys(address) : null,
  });

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

  // Update phone if provided
  if (phone !== undefined) {
    user.phone = phone;
  }

  // Debug existing address
  logger.debug(
    `Existing address for user ${userId} before update:`,
    user.address
  );

  // Update address if provided - handle explicitly without any middleware interference
  if (address) {
    logger.debug(`Updating address for user ${userId}:`, address);

    try {
      // Set address fields individually to avoid issues with schema validation
      if (user.address === undefined) {
        user.address = {};
      }

      user.address.street = address.street || "";
      user.address.city = address.city || "";
      user.address.state = address.state || "";
      user.address.zipCode = address.zipCode || "";
      user.address.country = address.country || "";

      // Mark the address field as modified to ensure it's saved
      user.markModified("address");

      logger.debug(`Address after assignment:`, user.address);
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

    // Log the updated address if it was part of the update
    if (address) {
      logger.debug(
        `Updated address in database for user ${userId}:`,
        user.address
      );
    }

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

/**
 * Initialize email change process
 */
const initiateEmailChange = async (userId, { email }) => {
  if (!email) {
    logger.warn(`Email change attempt missing new email for user: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("New email address is required", 400, {
        userId,
      }),
    };
  }

  // Validate email format
  const emailRegex =
    /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/;
  if (!emailRegex.test(email)) {
    logger.warn(
      `Email change attempt with invalid email format (${email}) for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError(
        "Please enter a valid email address",
        400,
        { userId, email }
      ),
    };
  }

  // Normalize the new email
  const normalizedNewEmail = normalizeEmail(email);

  // Check if email already exists
  const existingUser = await User.findOne({
    normalizedEmail: normalizedNewEmail,
  });

  if (existingUser && existingUser._id.toString() !== userId) {
    logger.warn(
      `Email change attempt to already used email (${email}) for user: ${userId}`
    );
    return {
      success: false,
      error: AppError.createAndLogError(
        "Email is already in use by another account",
        400,
        { userId, email }
      ),
    };
  }

  const user = await User.findById(userId);

  if (!user) {
    logger.warn(`Email change attempt for non-existent user ID: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError("User not found", 404, { userId }),
    };
  }

  // Check if new email is different from current
  if (normalizedNewEmail === normalizeEmail(user.email)) {
    logger.warn(`Email change attempt with same email for user: ${userId}`);
    return {
      success: false,
      error: AppError.createAndLogError(
        "New email must be different from your current email",
        400,
        { userId }
      ),
    };
  }

  // Store the pending email change
  user.pendingEmail = email;

  logger.info(
    `Email change initiated for user: ${userId} to new email: ${email}`
  );
  return { success: true, user, newEmail: email };
};

module.exports = {
  getUserById,
  updateUserProfile,
  changeUserPassword,
  disableUserAccount,
  initiateEmailChange,
};

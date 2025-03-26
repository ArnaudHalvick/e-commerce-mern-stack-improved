/**
 * Controller for validation endpoints
 * Provides validation rules for frontend forms
 *
 * These endpoints expose the backend validation rules to the frontend,
 * enabling consistent validation behavior across the application.
 * This approach ensures:
 * 1. Single source of truth for validation rules
 * 2. Frontend validation matches backend requirements
 * 3. Dynamic updates - changing rules in the backend automatically updates frontend validation
 */

const catchAsync = require("../utils/common/catchAsync");
const User = require("../models/User");
const {
  getUserProfileValidation,
  getPasswordChangeValidation,
  getPasswordResetValidation,
} = require("../validation");
const {
  getModelValidation,
} = require("../validation/extractors/schemaToValidation");
const logger = require("../utils/common/logger");

/**
 * Get validation rules for the user profile form
 * This endpoint provides validation rules extracted from:
 * - The Mongoose User schema
 * - The express-validator middleware for profile updates
 *
 * @route GET /api/validation/profile
 * @access Private
 * @returns {Object} Validation rules for profile fields including:
 *   - name (min/max length)
 *   - phone (pattern)
 *   - address fields (street, city, state, zipCode, country)
 */
const getProfileValidationRules = catchAsync(async (req, res, next) => {
  const validationRules = getUserProfileValidation();
  logger.info(`User ${req.user.id} requested profile validation rules`);
  logger.debug("Returning validation rules:", validationRules);
  res.json(validationRules);
});

/**
 * Get validation rules for the password change form
 * This endpoint provides validation rules for password changes:
 * - Current password requirements
 * - New password requirements (min length, pattern for complexity)
 * - Confirmation password validation
 *
 * @route GET /api/validation/password
 * @access Private
 * @returns {Object} Validation rules for password fields:
 *   - currentPassword
 *   - newPassword (with complexity requirements)
 *   - confirmPassword
 */
const getPasswordValidationRules = catchAsync(async (req, res, next) => {
  const validationRules = getPasswordChangeValidation();
  logger.info(`User ${req.user.id} requested password validation rules`);
  res.json(validationRules);
});

/**
 * Get validation rules for user registration
 * This endpoint provides validation rules for user registration:
 * - Username requirements
 * - Email validation
 * - Password complexity rules
 * - Confirmation password validation
 *
 * @route GET /api/validation/registration
 * @access Public
 * @returns {Object} Validation rules for registration fields
 */
const getRegistrationValidationRules = catchAsync(async (req, res, next) => {
  // Extract validation rules from User model
  const modelValidation = getModelValidation(User, [
    "name",
    "email",
    "password",
  ]);

  // Add password confirmation validation (this cannot be extracted from model)
  const validationRules = {
    ...modelValidation,
    passwordConfirm: {
      required: true,
      requiredMessage: "Please confirm your password",
      message: "Passwords must match",
    },
  };

  // Rename name to username for frontend consistency
  validationRules.username = validationRules.name;
  delete validationRules.name;

  logger.info(`Registration validation rules requested`);
  res.json(validationRules);
});

/**
 * Get validation rules for password reset
 * This endpoint provides validation rules for password reset:
 * - Token validation
 * - New password requirements (min length, pattern for complexity)
 * - Confirmation password validation
 *
 * @route GET /api/validation/password-reset
 * @access Public
 * @returns {Object} Validation rules for password reset fields:
 *   - token
 *   - password (with complexity requirements)
 *   - passwordConfirm
 */
const getPasswordResetValidationRules = catchAsync(async (req, res, next) => {
  const validationRules = getPasswordResetValidation();
  logger.info(`Password reset validation rules requested`);
  res.json(validationRules);
});

module.exports = {
  getProfileValidationRules,
  getPasswordValidationRules,
  getRegistrationValidationRules,
  getPasswordResetValidationRules,
};

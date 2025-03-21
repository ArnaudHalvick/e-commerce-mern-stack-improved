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

const asyncHandler = require("express-async-handler");
const {
  getUserProfileValidation,
  getPasswordChangeValidation,
} = require("../utils/schemaToValidation");
const logger = require("../utils/logger");

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
const getProfileValidationRules = asyncHandler(async (req, res) => {
  try {
    const validationRules = getUserProfileValidation();
    logger.info(`User ${req.user.id} requested profile validation rules`);
    res.json(validationRules);
  } catch (error) {
    logger.error("Error getting profile validation rules:", { error });
    throw error;
  }
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
const getPasswordValidationRules = asyncHandler(async (req, res) => {
  try {
    const validationRules = getPasswordChangeValidation();
    logger.info(`User ${req.user.id} requested password validation rules`);
    res.json(validationRules);
  } catch (error) {
    logger.error("Error getting password validation rules:", { error });
    throw error;
  }
});

module.exports = {
  getProfileValidationRules,
  getPasswordValidationRules,
};

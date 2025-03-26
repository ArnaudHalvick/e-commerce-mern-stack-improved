/**
 * Main validation module
 *
 * This module centralizes all validation-related functionality:
 * - Schema extraction (used for frontend validation)
 * - Express validator middleware (used for backend validation)
 * - Request sanitization middleware
 */

const extractors = require("./extractors");
const middleware = require("./middleware");

module.exports = {
  // Schema extraction
  extractValidationRules: extractors.extractValidationRules,
  extractFieldValidation: extractors.extractFieldValidation,
  getModelValidation: extractors.getModelValidation,

  // Model-specific validators
  getUserProfileValidation: extractors.getUserProfileValidation,
  getPasswordChangeValidation: extractors.getPasswordChangeValidation,
  getPasswordResetValidation: extractors.getPasswordResetValidation,

  // Express validator middleware
  validateRegistration: middleware.validateRegistration,
  validateLogin: middleware.validateLogin,
  validatePasswordChange: middleware.validatePasswordChange,
  validateProfileUpdate: middleware.validateProfileUpdate,
  validatePasswordReset: middleware.validatePasswordReset,

  // Sanitization middleware
  sanitizeRequest: middleware.sanitizeRequest,
  sanitizeFields: middleware.sanitizeFields,
};

/**
 * Model-specific validation extractors
 * This file contains functions to extract validation rules for specific models
 */

const User = require("../../models/User");
const { getModelValidation } = require("./schemaToValidation");

/**
 * Get validation rules for user profile fields
 * @returns {Object} - Validation rules for user profile
 */
const getUserProfileValidation = () => {
  // Fields relevant to the profile form
  const relevantFields = ["name", "phone", "address", "email"];

  // Custom validations that might not be directly extractable from the schema
  const customValidations = {
    phone: {
      pattern: "^[0-9]{10,15}$",
      message: "Phone number must contain 10-15 digits",
    },
    email: {
      pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
      message: "Please enter a valid email address",
    },
    address: {
      street: {
        minLength: 3,
        message: "Street address must be at least 3 characters long",
      },
      city: {
        minLength: 2,
        message: "City must be at least 2 characters long",
      },
      state: {
        minLength: 2,
        message: "State must be at least 2 characters long",
      },
      zipCode: {
        pattern: "^[0-9a-zA-Z\\-\\s]{3,10}$",
        message: "Please enter a valid zip/postal code",
      },
      country: {
        minLength: 2,
        message: "Country must be at least 2 characters long",
      },
    },
  };

  // Extract and merge validations
  return getModelValidation(User, relevantFields, customValidations);
};

/**
 * Get validation rules for password change
 * @returns {Object} - Validation rules for password change
 */
const getPasswordChangeValidation = () => {
  return {
    currentPassword: {
      required: true,
      requiredMessage: "Current password is required",
    },
    newPassword: {
      required: true,
      requiredMessage: "New password is required",
      minLength: 8,
      pattern:
        "[A-Z].*[0-9].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[0-9].*[A-Z].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*[A-Z].*[0-9]",
      message:
        "Password must contain at least 1 uppercase letter, 1 number, and 1 special character",
    },
    confirmPassword: {
      required: true,
      requiredMessage: "Please confirm your password",
      message: "Passwords must match",
    },
  };
};

module.exports = {
  getUserProfileValidation,
  getPasswordChangeValidation,
};

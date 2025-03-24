// Path: backend/validation/extractors/modelValidations.js

/**
 * Model-specific validation extractors
 * This file contains functions to extract validation rules for specific models
 */

const User = require("../../models/User");
const {
  getModelValidation,
  extractValidationRules,
} = require("./schemaToValidation");

/**
 * Get validation rules for user profile fields
 * @returns {Object} - Validation rules for user profile
 */
const getUserProfileValidation = () => {
  // Fields relevant to the profile form
  const relevantFields = ["name", "phone", "address", "email"];

  // Extract validations from the model first
  const modelValidations = getModelValidation(User, relevantFields);

  // Only add custom validations for fields that weren't properly extracted
  const customValidations = {
    email: {
      pattern: !modelValidations.email?.pattern
        ? "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
        : undefined,
      message: !modelValidations.email?.message
        ? "Please enter a valid email address"
        : undefined,
    },
  };

  // Handle address validation - extract directly from schema paths
  const userSchema = User.schema;
  const addressFields = Object.keys(userSchema.paths).filter((path) =>
    path.startsWith("address.")
  );

  if (addressFields.length > 0) {
    // Initialize the address object if it doesn't exist
    if (!modelValidations.address) {
      modelValidations.address = {};
    }

    // For each address field, extract validation rules
    addressFields.forEach((fullPath) => {
      // Extract the field name after 'address.'
      const fieldName = fullPath.replace("address.", "");

      // Skip internal fields like __v or _id
      if (fieldName === "_id" || fieldName === "__v") return;

      const schemaType = userSchema.paths[fullPath];

      // Initialize field if needed
      if (!modelValidations.address[fieldName]) {
        modelValidations.address[fieldName] = {};
      }

      // Extract validators from this field
      if (schemaType.validators && schemaType.validators.length > 0) {
        schemaType.validators.forEach((validator) => {
          // Skip non-validator functions
          if (!validator || !validator.validator) return;

          // Process validator functions to extract rules
          if (typeof validator.validator === "function") {
            const fnString = validator.validator.toString();

            // Extract minLength validator
            const minLengthMatch = fnString.match(/v\.length\s*>=\s*(\d+)/);
            if (minLengthMatch && minLengthMatch[1]) {
              modelValidations.address[fieldName].minLength = parseInt(
                minLengthMatch[1]
              );
            }

            // Extract regex pattern
            const regexMatch = fnString.match(/\/([^\/]+)\//);
            if (regexMatch && regexMatch[1]) {
              modelValidations.address[fieldName].pattern = regexMatch[1];
            }
          }

          // Extract validation message
          if (validator.message) {
            modelValidations.address[fieldName].message =
              typeof validator.message === "function"
                ? validator.message({ value: "" })
                : validator.message;
          }
        });
      }
    });
  }

  // Remove any undefined values from customValidations
  Object.keys(customValidations).forEach((key) => {
    if (customValidations[key] === undefined) {
      delete customValidations[key];
    } else if (typeof customValidations[key] === "object") {
      Object.keys(customValidations[key]).forEach((nestedKey) => {
        if (customValidations[key][nestedKey] === undefined) {
          delete customValidations[key][nestedKey];
        }
      });
    }
  });

  // Merge with model validations
  return { ...modelValidations, ...customValidations };
};

/**
 * Get validation rules for password change
 * @returns {Object} - Validation rules for password change
 */
const getPasswordChangeValidation = () => {
  // Extract password validation rules from User model
  const userSchema = User.schema;
  const passwordField = userSchema.paths.password;
  const passwordValidation = {};

  // Extract minLength from the schema
  if (passwordField.options.minLength) {
    passwordValidation.minLength = passwordField.options.minLength;
  }

  // Extract pattern and message from validator function
  if (passwordField.validators && passwordField.validators.length > 0) {
    passwordField.validators.forEach((validator) => {
      if (validator.validator && typeof validator.validator === "function") {
        const fnString = validator.validator.toString();

        // Parse the validator function to extract pattern requirements
        if (
          fnString.includes("hasUppercase") &&
          fnString.includes("hasNumber") &&
          fnString.includes("hasSpecial")
        ) {
          passwordValidation.pattern =
            "[A-Z].*[0-9].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[0-9].*[A-Z].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*[A-Z].*[0-9]";
        }

        // Extract message
        if (validator.message) {
          passwordValidation.message =
            typeof validator.message === "function"
              ? validator.message({ value: "" })
              : validator.message;
        }
      }
    });
  }

  // Return validation rules
  return {
    currentPassword: {
      required: true,
      requiredMessage: "Current password is required",
    },
    newPassword: {
      required: true,
      requiredMessage: "New password is required",
      minLength: passwordValidation.minLength,
      pattern: passwordValidation.pattern,
      message:
        passwordValidation.message ||
        "Password must contain meet the requirements",
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

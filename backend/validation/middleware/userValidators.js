/**
 * User validation middleware
 *
 * This file contains express-validator middleware for user-related routes
 * These validators are used for request validation before reaching controllers
 */

const { body, validationResult } = require("express-validator");
const User = require("../../models/User");
const { normalizeEmail } = require("../../utils/emails/emailNormalizer");
const AppError = require("../../utils/errors/AppError");
const {
  getUserProfileValidation,
  getPasswordChangeValidation,
} = require("../extractors/modelValidations");
const { getModelValidation } = require("../extractors/schemaToValidation");

/**
 * Utility function to check validation results
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    // Use AppError.createAndLogError for consistent error handling with logging
    return next(
      AppError.createAndLogError(
        firstError.msg,
        400,
        {
          method: req.method,
          path: req.originalUrl,
          body: req.body,
          userErrors: errors.array().map((err) => ({
            param: err.param,
            msg: err.msg,
          })),
        },
        errors.array()
      )
    );
  }
  next();
};

/**
 * User registration validation
 * Validates username, email, password, and password confirmation
 */
const validateRegistration = [
  // Store validation rules in request for use in subsequent middleware
  (req, res, next) => {
    // Extract validation rules directly from User model
    const userValidation = getModelValidation(User, [
      "name",
      "email",
      "password",
    ]);
    req.validationRules = userValidation;
    next();
  },

  // Username validation based on model rules
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .custom((value, { req }) => {
      const nameRules = req.validationRules.name;

      if (nameRules.minLength && value.length < nameRules.minLength) {
        throw new Error(
          nameRules.message ||
            `Username must be at least ${nameRules.minLength} characters`
        );
      }

      if (nameRules.maxLength && value.length > nameRules.maxLength) {
        throw new Error(
          nameRules.message ||
            `Username cannot exceed ${nameRules.maxLength} characters`
        );
      }

      return true;
    }),

  // Email validation with normalization for Gmail
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .custom((value) => {
      // Use a more permissive regex for email validation
      const emailRegex =
        /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;
      if (!emailRegex.test(value)) {
        throw new Error("Please provide a valid email address");
      }
      return true;
    })
    .customSanitizer((value) => {
      return value.toLowerCase();
    })
    .custom(async (value) => {
      // Normalize the email address to check for duplicates
      const normalizedEmail = normalizeEmail(value);

      // Look for an account with the normalized email
      const existingUser = await User.findOne({ normalizedEmail });

      if (existingUser) {
        // If the normalized emails match, it means this email is already in use
        throw new Error("Email is already in use");
      }

      return true;
    }),

  // Password validation based on model rules
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom((value, { req }) => {
      const passwordRules = req.validationRules.password;

      if (passwordRules.minLength && value.length < passwordRules.minLength) {
        throw new Error(
          `Password must be at least ${passwordRules.minLength} characters long`
        );
      }

      // Check for uppercase, number and special char based on the model's validator
      if (!/[A-Z]/.test(value)) {
        throw new Error("Password must contain at least 1 uppercase letter");
      }

      if (!/[0-9]/.test(value)) {
        throw new Error("Password must contain at least 1 number");
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        throw new Error("Password must contain at least 1 special character");
      }

      return true;
    }),

  // Password confirmation validation
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validateResults,
];

/**
 * Login validation
 * Validates email and password
 */
const validateLogin = [
  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .custom((value) => {
      // Use a more permissive regex for email validation
      const emailRegex =
        /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;
      if (!emailRegex.test(value)) {
        throw new Error("Please provide a valid email address");
      }
      return true;
    })
    .customSanitizer((value) => {
      // Normalize the email for login
      return normalizeEmail(value);
    }),

  // Password validation
  body("password").notEmpty().withMessage("Password is required"),

  validateResults,
];

/**
 * Password change validation
 * Validates current password, new password, and password confirmation
 */
const validatePasswordChange = [
  // Store password validation rules for use in subsequent middleware
  (req, res, next) => {
    // Get password validation rules from model
    const passwordValidation = getPasswordChangeValidation();
    req.passwordValidation = passwordValidation;
    next();
  },

  // Current password validation
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  // New password validation using extracted rules
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .custom((value, { req }) => {
      const rules = req.passwordValidation.newPassword;

      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(
          `Password must be at least ${rules.minLength} characters long`
        );
      }

      // Check for pattern using regex if available
      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          throw new Error(
            rules.message || "Password does not meet complexity requirements"
          );
        }
      } else {
        // Fallback checks if pattern not available
        if (!/[A-Z]/.test(value)) {
          throw new Error("Password must contain at least 1 uppercase letter");
        }

        if (!/[0-9]/.test(value)) {
          throw new Error("Password must contain at least 1 number");
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          throw new Error("Password must contain at least 1 special character");
        }
      }

      return true;
    }),

  // Confirm new password validation
  body("newPasswordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords do not match");
      }
      return true;
    }),

  validateResults,
];

/**
 * Profile update validation
 * Validates name, phone, and address fields
 */
const validateProfileUpdate = [
  // Get validation rules from the User model
  (req, res, next) => {
    // Store the validation rules for use in subsequent middleware
    req.validationRules = getUserProfileValidation();
    next();
  },

  // Name validation
  body("name")
    .optional()
    .trim()
    .custom((value, { req }) => {
      const rules = req.validationRules.name;

      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(
          rules.message || `Name must be at least ${rules.minLength} characters`
        );
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        throw new Error(
          rules.message || `Name cannot exceed ${rules.maxLength} characters`
        );
      }

      return true;
    }),

  // Phone validation
  body("phone")
    .optional()
    .trim()
    .custom((value, { req }) => {
      const rules = req.validationRules.phone;

      if (rules && rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          throw new Error(rules.message || "Invalid phone number format");
        }
      }

      return true;
    }),

  // Dynamic address validation
  body("address.street")
    .optional()
    .trim()
    .custom((value, { req }) => {
      const rules = req.validationRules.address?.street;
      if (rules?.minLength && value.length < rules.minLength) {
        throw new Error(
          rules.message ||
            `Street must be at least ${rules.minLength} characters`
        );
      }
      return true;
    }),

  // Similar custom validators for other address fields...

  validateResults,
];

/**
 * Password reset validation
 * Validates the token and new password for password reset
 */
const validatePasswordReset = [
  // Token validation
  body("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isString()
    .withMessage("Invalid reset token format"),

  // Password validation with same rules as registration
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least 1 uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least 1 number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least 1 special character"),

  // Password confirmation validation
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validateResults,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validatePasswordReset,
};

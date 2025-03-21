/**
 * User validation middleware
 *
 * This file contains express-validator middleware for user-related routes
 * These validators are used for request validation before reaching controllers
 */

const { body, validationResult } = require("express-validator");
const User = require("../../models/User");
const { normalizeEmail } = require("../../utils/emailNormalizer");

/**
 * Utility function to check validation results
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return the first error message
      errors: errors.array(),
    });
  }
  next();
};

/**
 * User registration validation
 * Validates username, email, password, and password confirmation
 */
const validateRegistration = [
  // Username validation
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("Username must be between 2 and 30 characters"),

  // Email validation with normalization for Gmail
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
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

  // Password validation
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    ),

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
    .isEmail()
    .withMessage("Please provide a valid email address")
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
  // Current password validation
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  // New password validation
  body("newPassword")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "New password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    ),

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
  // Name validation
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Name must be between 2 and 30 characters"),

  // Phone validation
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must contain 10-15 digits"),

  // Address validation - street
  body("address.street")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Street address must be at least 3 characters long"),

  // Address validation - city
  body("address.city")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters long"),

  // Address validation - state
  body("address.state")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("State must be at least 2 characters long"),

  // Address validation - zipCode
  body("address.zipCode")
    .optional()
    .trim()
    .matches(/^[0-9a-zA-Z\-\s]{3,10}$/)
    .withMessage("Please enter a valid zip/postal code"),

  // Address validation - country
  body("address.country")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Country must be at least 2 characters long"),

  validateResults,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
};

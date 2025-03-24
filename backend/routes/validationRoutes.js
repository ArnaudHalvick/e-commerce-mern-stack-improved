/**
 * Routes for validation endpoints
 */

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  getProfileValidationRules,
  getPasswordValidationRules,
  getRegistrationValidationRules,
  getPasswordResetValidationRules,
} = require("../controllers/validationController");

// Get validation rules for profile update
router.get("/profile", isAuthenticated, getProfileValidationRules);

// Get validation rules for password change
router.get("/password", isAuthenticated, getPasswordValidationRules);

// Get validation rules for user registration (public endpoint)
router.get("/registration", getRegistrationValidationRules);

// Get validation rules for password reset (public endpoint)
router.get("/password-reset", getPasswordResetValidationRules);

module.exports = router;

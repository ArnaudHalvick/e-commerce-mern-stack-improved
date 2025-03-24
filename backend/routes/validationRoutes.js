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
} = require("../controllers/validationController");

// Get validation rules for profile update
router.get("/profile", isAuthenticated, getProfileValidationRules);

// Get validation rules for password change
router.get("/password", isAuthenticated, getPasswordValidationRules);

// Get validation rules for user registration (public endpoint)
router.get("/registration", getRegistrationValidationRules);

module.exports = router;

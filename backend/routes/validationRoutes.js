/**
 * Routes for validation endpoints
 */

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  getProfileValidationRules,
  getPasswordValidationRules,
} = require("../controllers/validationController");

// Get validation rules for profile update
router.get("/profile", isAuthenticated, getProfileValidationRules);

// Get validation rules for password change
router.get("/password", isAuthenticated, getPasswordValidationRules);

module.exports = router;

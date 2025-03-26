// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const {
  isAuthenticated,
  isNotAuthenticated,
  verifyRefreshToken,
} = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validatePasswordReset,
  sanitizeRequest,
} = require("../validation");

// Public routes - Authentication
router.post(
  "/signup",
  sanitizeRequest,
  isNotAuthenticated,
  validateRegistration,
  authController.registerUser
);
router.post(
  "/login",
  sanitizeRequest,
  isNotAuthenticated,
  validateLogin,
  authController.loginUser
);
router.post("/refresh-token", verifyRefreshToken, authController.refreshToken);
router.post(
  "/request-verification",
  sanitizeRequest,
  authController.requestVerification
);
router.get("/verify-email/:token", authController.verifyEmail);
router.get("/verify-email", authController.verifyEmail);
router.post("/forgot-password", sanitizeRequest, authController.forgotPassword);
router.post(
  "/reset-password",
  sanitizeRequest,
  validatePasswordReset,
  authController.resetPassword
);

// Protected routes - Authentication
router.post("/logout", isAuthenticated, authController.logoutUser);
router.get("/verify-token", isAuthenticated, authController.verifyToken);

// Protected routes - Profile management
router.get("/me", isAuthenticated, profileController.getUserProfile);
router.put(
  "/profile",
  sanitizeRequest,
  isAuthenticated,
  validateProfileUpdate,
  profileController.updateProfile
);
router.put(
  "/change-password",
  sanitizeRequest,
  isAuthenticated,
  validatePasswordChange,
  profileController.changePassword
);
router.put(
  "/disable-account",
  sanitizeRequest,
  isAuthenticated,
  profileController.disableAccount
);
router.post(
  "/change-email",
  sanitizeRequest,
  isAuthenticated,
  profileController.requestEmailChange
);

module.exports = router;

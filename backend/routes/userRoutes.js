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
} = require("../validation");

// Public routes - Authentication
router.post(
  "/signup",
  isNotAuthenticated,
  validateRegistration,
  authController.registerUser
);
router.post(
  "/login",
  isNotAuthenticated,
  validateLogin,
  authController.loginUser
);
router.post("/refresh-token", verifyRefreshToken, authController.refreshToken);
router.post("/request-verification", authController.requestVerification);
router.get("/verify-email/:token", authController.verifyEmail);
router.get("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password",
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
  isAuthenticated,
  validateProfileUpdate,
  profileController.updateProfile
);
router.put(
  "/change-password",
  isAuthenticated,
  validatePasswordChange,
  profileController.changePassword
);
router.put(
  "/disable-account",
  isAuthenticated,
  profileController.disableAccount
);
router.post(
  "/change-email",
  isAuthenticated,
  profileController.requestEmailChange
);

module.exports = router;

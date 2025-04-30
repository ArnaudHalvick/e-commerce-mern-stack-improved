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
const { sanitizeRequest } = require("../middleware/sanitizers");
const {
  loginLimiter,
  accountCreationLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimit");

// Public routes - Authentication
router.post(
  "/signup",
  accountCreationLimiter,
  sanitizeRequest,
  isNotAuthenticated,
  authController.registerUser
);
router.post(
  "/login",
  loginLimiter,
  sanitizeRequest,
  isNotAuthenticated,
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
router.post(
  "/forgot-password",
  passwordResetLimiter,
  sanitizeRequest,
  authController.forgotPassword
);
router.post("/reset-password", sanitizeRequest, authController.resetPassword);

// Protected routes - Authentication
router.post("/logout", isAuthenticated, authController.logoutUser);
router.get("/verify-token", isAuthenticated, authController.verifyToken);

// Protected routes - Profile management
router.get("/me", isAuthenticated, profileController.getUserProfile);
router.put(
  "/profile",
  sanitizeRequest,
  isAuthenticated,
  profileController.updateProfile
);
router.put(
  "/change-password",
  sanitizeRequest,
  isAuthenticated,
  profileController.changePassword
);
router.put(
  "/disable-account",
  sanitizeRequest,
  isAuthenticated,
  profileController.disableAccount
);

module.exports = router;

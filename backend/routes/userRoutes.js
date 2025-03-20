// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated, verifyRefreshToken } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
} = require("../middleware/validators");

// Public routes
router.post("/signup", validateRegistration, userController.registerUser);
router.post("/login", validateLogin, userController.loginUser);
router.post("/refresh-token", verifyRefreshToken, userController.refreshToken);
router.post("/request-verification", userController.requestVerification);
router.get("/verify-email/:token", userController.verifyEmail);
router.get("/verify-email", userController.verifyEmail);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Protected routes
router.post("/logout", isAuthenticated, userController.logoutUser);
router.get("/me", isAuthenticated, userController.getUserProfile);
router.put(
  "/profile",
  isAuthenticated,
  validateProfileUpdate,
  userController.updateProfile
);
router.get("/verify-token", isAuthenticated, userController.verifyToken);

// New profile management routes
router.put(
  "/change-password",
  isAuthenticated,
  validatePasswordChange,
  userController.changePassword
);
router.put("/disable-account", isAuthenticated, userController.disableAccount);

module.exports = router;

// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated, verifyRefreshToken } = require("../middleware/auth");

// Public routes
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh-token", verifyRefreshToken, userController.refreshToken);
router.post("/request-verification", userController.requestVerification);
router.get("/verify-email", userController.verifyEmail);

// Protected routes
router.get("/logout", isAuthenticated, userController.logoutUser);
router.get("/me", isAuthenticated, userController.getUserProfile);
router.put("/profile", isAuthenticated, userController.updateProfile);
router.get("/verify-token", isAuthenticated, userController.verifyToken);

// New profile management routes
router.put("/change-password", isAuthenticated, userController.changePassword);
router.put("/disable-account", isAuthenticated, userController.disableAccount);

module.exports = router;

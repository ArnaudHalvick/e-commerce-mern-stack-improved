// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuthenticated, verifyRefreshToken } = require("../middleware/auth");

// Public routes
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh-token", verifyRefreshToken, userController.refreshToken);

// Protected routes
router.get("/logout", isAuthenticated, userController.logoutUser);
router.get("/me", isAuthenticated, userController.getUserProfile);

module.exports = router;

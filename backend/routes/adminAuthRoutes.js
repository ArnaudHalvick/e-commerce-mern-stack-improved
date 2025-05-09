// backend/routes/adminAuthRoutes.js

const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { isAdmin, verifyRefreshToken } = require("../middleware/auth");
const { sanitizeRequest } = require("../middleware/sanitizers");
const { loginLimiter } = require("../middleware/rateLimit");

// Public admin auth routes
router.post(
  "/login",
  loginLimiter,
  sanitizeRequest,
  adminAuthController.loginAdmin
);

// Protected admin auth routes
router.post("/logout", isAdmin, adminAuthController.logoutAdmin);
router.get("/verify", isAdmin, adminAuthController.verifyAdminToken);
router.post("/refresh-token", verifyRefreshToken, (req, res, next) => {
  // Check if the user is an admin before allowing token refresh
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  // Generate new access token
  const accessToken = req.user.generateAccessToken();

  res.status(200).json({
    success: true,
    accessToken,
    isAdmin: true,
  });
});

module.exports = router;

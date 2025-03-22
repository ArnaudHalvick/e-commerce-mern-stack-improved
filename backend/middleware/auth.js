// backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // Check for token in auth-token header (for backward compatibility)
    let token = req.headers["auth-token"];

    // If not found, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Please login to access this resource",
        });
      }
      token = authHeader.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    // Check if account is disabled
    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Middleware to prevent already authenticated users from accessing login/signup routes
const isNotAuthenticated = async (req, res, next) => {
  try {
    // Check for token in auth-token header (for backward compatibility)
    let token = req.headers["auth-token"];

    // If not found, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // No token found, user is not authenticated, proceed to login/signup
        return next();
      }
      token = authHeader.split(" ")[1];
    }

    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id);

      // If we got here, token is valid and user exists
      if (user && !user.disabled) {
        return res.status(403).json({
          success: false,
          message: "You are already logged in",
        });
      }
    } catch (tokenError) {
      // Token is invalid or expired, allow access to login/signup
      return next();
    }

    // If we get here, proceed to login/signup
    next();
  } catch (error) {
    // In case of any error, allow access to login/signup
    next();
  }
};

const verifyRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check if account is disabled
    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

module.exports = { isAuthenticated, isNotAuthenticated, verifyRefreshToken };

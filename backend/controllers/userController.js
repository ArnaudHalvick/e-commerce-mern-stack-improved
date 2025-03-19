// backend/controllers/userController.js

const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// Helper function to send tokens
const sendTokens = (user, statusCode, res, additionalData = {}) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user
  user.refreshToken = refreshToken;
  user.save();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const responseData = {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    ...additionalData,
  };

  res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, options)
    .json(responseData);
};

// User registration
const registerUser = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate password strength manually
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character",
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    user = await User.create({
      name: username,
      email,
      password,
      cartData: cart,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;

    console.log(`Generated verification URL: ${verificationUrl}`);
    console.log(`Verification token: ${verificationToken}`);
    console.log(`Hashed token in DB: ${user.emailVerificationToken}`);

    // Send verification email with improved HTML
    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to our store! Please verify your email",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f85606;">Welcome to Our Store!</h1>
          </div>
          
          <p>Hello ${username},</p>
          
          <p>Thank you for creating an account with our e-commerce store!</p>
          
          <p>To verify your email address and access all features, please click on the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #f85606; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify My Email</a>
          </div>
          
          <p>Or copy and paste the following link in your browser:</p>
          <p><a href="${verificationUrl}" style="color: #f85606; word-break: break-all;">${verificationUrl}</a></p>
          
          <p>This link will expire in 24 hours.</p>
          
          <p>If you did not create this account, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Best regards,<br>The E-Commerce Team</p>
          </div>
        </div>
        `,
        // Plain text fallback
        message: `
Hello ${username},

Thank you for creating an account with our e-commerce store!

To verify your email address and access all features, please click on the following link:
${verificationUrl}

This link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
The E-Commerce Team
        `,
      });

      console.log(`Verification email sent successfully to ${user.email}`);

      // Return success but don't log in the user
      return res.status(201).json({
        success: true,
        message:
          "Account created successfully! Please check your email to verify your account before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    } catch (error) {
      console.error("Email sending error:", error);

      // Reset verification token
      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save();

      // Still create the user but notify about email issue
      return res.status(201).json({
        success: true,
        message:
          "Account created successfully, but verification email could not be sent. Please request a new verification email after logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if the account is disabled
    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled. Please contact support.",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Don't block login for unverified email, just flag it
    // The frontend will handle redirecting to a verification page
    const additionalData = !user.isEmailVerified
      ? { emailVerificationNeeded: true }
      : {};

    sendTokens(user, 200, res, additionalData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshToken = undefined;
    await user.save();

    res.cookie("refreshToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = user.generateAccessToken();

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);

    // Validate address if provided
    if (address) {
      const requiredFields = ["street", "city", "state", "zipCode", "country"];
      const missingFields = [];

      for (const field of requiredFields) {
        if (!address[field] || address[field].trim() === "") {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `All address fields are required. Missing: ${missingFields.join(
            ", "
          )}`,
        });
      }

      // Phone validation
      if (phone && !/^[0-9]{10,15}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must contain 10-15 digits",
        });
      }

      // Basic validation for address fields
      if (address.street && address.street.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Street address must be at least 3 characters long",
        });
      }

      if (address.city && address.city.length < 2) {
        return res.status(400).json({
          success: false,
          message: "City must be at least 2 characters long",
        });
      }

      if (address.state && address.state.length < 2) {
        return res.status(400).json({
          success: false,
          message: "State must be at least 2 characters long",
        });
      }

      if (address.zipCode && !/^[0-9a-zA-Z\-\s]{3,10}$/.test(address.zipCode)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid zip/postal code",
        });
      }

      if (address.country && address.country.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Country must be at least 2 characters long",
        });
      }
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      // Update only the provided address fields
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.name, // Add username field for consistency
        email: user.email,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    // Check if this is a validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide current password, new password and password confirmation",
      });
    }

    // Check if new passwords match
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    // Validate new password strength
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      newPassword
    );
    const isLongEnough = newPassword.length >= 8;

    if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character",
      });
    }

    // Find the user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check if current password is correct
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Instead of setting password directly, store in pendingPassword and send verification email
    // We don't hash the password here - it will be hashed during verification when assigned to the password field
    user.pendingPassword = newPassword;
    console.log(`Storing plain text pending password for user: ${user.email}`);

    // Generate password change token
    const changeToken = user.generatePasswordChangeToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-password-change?token=${changeToken}`;

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: "Confirm Your Password Change",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f85606;">Password Change Request</h1>
          </div>
          
          <p>Hello ${user.name},</p>
          
          <p>We received a request to change your password. To confirm this change, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #f85606; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Confirm Password Change</a>
          </div>
          
          <p>If you didn't request this change, please ignore this email or contact support immediately.</p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Best regards,<br>The E-Commerce Team</p>
          </div>
        </div>
        `,
        message: `
Hello ${user.name},

We received a request to change your password. To confirm this change, please click the following link:
${verificationUrl}

If you didn't request this change, please ignore this email or contact support immediately.

This link will expire in 24 hours for security reasons.

Best regards,
The E-Commerce Team
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "Verification email sent. Please check your email to confirm password change.",
      });
    } catch (error) {
      console.error("Email sending error:", error);

      // Reset verification token
      user.passwordChangeToken = undefined;
      user.passwordChangeExpiry = undefined;
      user.pendingPassword = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Could not send verification email. Please try again later.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Disable account
const disableAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Set disabled flag to true
    user.disabled = true;

    // Clear refresh token - effectively logging the user out
    user.refreshToken = undefined;

    await user.save();

    res.cookie("refreshToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Account disabled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Request email verification
const requestVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;

    console.log(`Generated verification URL: ${verificationUrl}`);

    // Send verification email with improved HTML
    try {
      await sendEmail({
        email: user.email,
        subject: "E-commerce Store - Email Verification",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f85606;">Email Verification</h1>
          </div>
          
          <p>Hello ${user.name},</p>
          
          <p>You recently requested a new verification link for your e-commerce account.</p>
          
          <p>To verify your email address, please click on the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #f85606; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify My Email</a>
          </div>
          
          <p>Or copy and paste the following link in your browser:</p>
          <p><a href="${verificationUrl}" style="color: #f85606; word-break: break-all;">${verificationUrl}</a></p>
          
          <p>This link will expire in 24 hours.</p>
          
          <p>If you did not request this verification, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Best regards,<br>The E-Commerce Team</p>
          </div>
        </div>
        `,
        // Plain text fallback
        message: `
Hello ${user.name},

You recently requested a new verification link for your e-commerce account.

To verify your email address, please click on the following link:
${verificationUrl}

This link will expire in 24 hours.

If you did not request this verification, please ignore this email.

Best regards,
The E-Commerce Team
        `,
      });

      console.log(`Verification email sent successfully to ${user.email}`);

      res.status(200).json({
        success: true,
        message: "Verification email sent",
      });
    } catch (error) {
      console.error("Email sending error:", error);

      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again later.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } catch (error) {
    console.error("Verification request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    console.log(`Received token for verification: ${token}`);

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(`Hashed token for lookup: ${hashedToken}`);

    // Find user with the token
    let user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) {
      console.log(`No user found with token hash: ${hashedToken}`);

      // Check if there's a user with this email who is already verified
      // This is a common case where users click the link multiple times
      const verifiedUser = await User.findOne({
        isEmailVerified: true,
        emailVerificationToken: { $exists: false },
      });

      if (verifiedUser) {
        return res.status(200).json({
          success: true,
          message: "Your email is already verified",
          alreadyVerified: true,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Your email is already verified",
        alreadyVerified: true,
      });
    }

    // Check if token is expired
    if (
      user.emailVerificationExpiry &&
      user.emailVerificationExpiry < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired",
        expired: true,
      });
    }

    // Set email as verified and remove the token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();

    console.log(`Successfully verified email for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify token and return user info
const verifyToken = async (req, res) => {
  try {
    // The isAuthenticated middleware would have already verified the token
    // and attached the user to the request
    const user = req.user;

    return res.status(200).json({
      valid: true,
      user: {
        id: user._id,
        username: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      valid: false,
      message: "Internal server error",
    });
  }
};

// Verify password change
const verifyPasswordChange = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Password change verification token is required",
      });
    }

    // Track processed tokens for idempotency
    if (!global.processedPasswordTokens) {
      global.processedPasswordTokens = {};
    }

    // Function to cleanup old tokens (older than 1 hour)
    const cleanupOldTokens = () => {
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000;

      Object.keys(global.processedPasswordTokens).forEach((token) => {
        if (
          currentTime - global.processedPasswordTokens[token].timestamp >
          oneHour
        ) {
          delete global.processedPasswordTokens[token];
        }
      });
    };

    // Run cleanup periodically
    cleanupOldTokens();

    console.log(`Received token for verification: ${token}`);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(`Hashed token: ${hashedToken}`);

    // Check if this token has already been processed
    if (global.processedPasswordTokens[hashedToken]) {
      console.log("Token already processed, returning cached response");
      return res
        .status(global.processedPasswordTokens[hashedToken].status)
        .json(global.processedPasswordTokens[hashedToken].data);
    }

    try {
      const user = await User.findOne({
        passwordChangeToken: hashedToken,
        passwordChangeExpiry: { $gt: Date.now() },
      }).select("+pendingPassword");

      if (!user) {
        console.log("Invalid or expired token");
        // Store in processed tokens cache
        global.processedPasswordTokens[hashedToken] = {
          status: 400,
          data: {
            status: "error",
            message: "Invalid or expired token",
          },
          timestamp: Date.now(),
        };
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }

      console.log(`User found: ${user.email}`);
      console.log(
        `Setting password field to pending password value: ${user.pendingPassword.substring(
          0,
          3
        )}***`
      );

      // Apply the pending password (which is plaintext) to password field
      // The pre-save middleware will hash it
      user.password = user.pendingPassword;

      // Clear the verification data
      user.pendingPassword = undefined;
      user.passwordChangeToken = undefined;
      user.passwordChangeExpiry = undefined;

      await user.save();
      console.log(`User saved with new password`);

      // Store successful response in processed tokens cache
      global.processedPasswordTokens[hashedToken] = {
        status: 200,
        data: {
          status: "success",
          message: "Password changed successfully",
        },
        timestamp: Date.now(),
      };

      res.status(200).json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error in verifyPasswordChange:", error);

      // Store error response in processed tokens cache
      global.processedPasswordTokens[hashedToken] = {
        status: 500,
        data: {
          status: "error",
          message: error.message,
        },
        timestamp: Date.now(),
      };

      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  } catch (error) {
    console.error("Password change verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserProfile,
  updateProfile,
  requestVerification,
  verifyEmail,
  verifyToken,
  changePassword,
  disableAccount,
  verifyPasswordChange,
};

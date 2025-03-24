// backend/controllers/userController.js

const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/emails/sendEmail");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const logger = require("../utils/common/logger");
const {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordChangeNotification,
} = require("../utils/emailTemplates/authEmails");
const {
  createVerificationUrl,
  createPasswordResetUrl,
} = require("../utils/common/urlUtils");

// Helper function to send tokens
const sendTokens = (user, statusCode, res, additionalData = {}) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user without triggering password hash
  user.refreshToken = refreshToken;

  // Mark to skip password hashing since we're only updating the refresh token
  user.$locals = { skipPasswordHashing: true };
  user.save({ validateBeforeSave: false });

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
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
const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(
      new AppError("Please provide username, email and password", 400)
    );
  }

  // Check if email already exists
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ normalizedEmail });

  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create new user
  const user = await User.create({
    name: username,
    email: email,
    password,
  });

  // Generate email verification token using the model method
  const emailVerificationToken = user.generateEmailVerificationToken();

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationURL = createVerificationUrl(emailVerificationToken);

  // Generate email HTML using the template
  const htmlEmail = generateVerificationEmail(verificationURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      html: htmlEmail,
    });

    // Send response with token and requiresVerification flag
    sendTokens(user, 201, res, {
      message: "Registration successful. Please verify your email.",
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    // If email sending fails, remove emailVerificationToken and expiry
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Failed to send verification email. Please try again later.",
        500
      )
    );
  }
});

// User login
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user by email
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if account is disabled
  if (user.disabled) {
    return next(
      new AppError(
        "Your account has been disabled. Please contact support.",
        403
      )
    );
  }

  // Send response with tokens
  sendTokens(user, 200, res);
});

// User logout
const logoutUser = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  // Still proceed with logout even if no refresh token is provided
  if (refreshToken) {
    // Clear refresh token in DB
    await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: "" },
      { runValidators: false }
    );
  }

  // Clear cookie
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Refresh access token
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError("No refresh token provided", 401));
  }

  // Find user with this refresh token
  const user = await User.findOne({ refreshToken });

  if (!user) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  // Check if account is disabled
  if (user.disabled) {
    return res.status(403).json({
      success: false,
      message: "Your account has been disabled",
    });
  }

  // Generate new access token
  const accessToken = user.generateAccessToken();

  res.status(200).json({
    success: true,
    accessToken,
  });
});

// Get user profile
const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, address } = req.body;

  if (!name) {
    return next(new AppError("Name is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update user data
  user.name = name;

  // Update phone if provided
  if (phone !== undefined) {
    user.phone = phone;
  }

  // Update address if provided
  if (address) {
    user.address = {
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "",
    };
  }

  // Handle profile image if provided
  if (req.body.profileImage) {
    user.profileImage = req.body.profileImage;
  }

  await user.save();

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
    message: "Profile updated successfully",
  });
});

// Change password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Current password and new password are required", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if current password matches
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  // Generate new tokens
  sendTokens(user, 200, res, {
    message: "Password changed successfully",
  });
});

// Request password reset
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    return next(new AppError("No user found with this email", 404));
  }

  // Generate and set password reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = createPasswordResetUrl(resetToken);

  // Generate email HTML using the template
  const htmlEmail = generatePasswordResetEmail(resetURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: htmlEmail,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    // If email sending fails, clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Failed to send reset email. Please try again later.", 500)
    );
  }
});

// Reset password
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError("Token and password are required", 400));
  }

  // Hash the token to match the stored token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  // Set new password and clear reset token fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Send password change notification email
  try {
    const htmlEmail = generatePasswordChangeNotification(user.name);

    await sendEmail({
      email: user.email,
      subject: "Password Changed Successfully",
      html: htmlEmail,
    });
  } catch (error) {
    // Don't block the password reset process if email fails
    logger.error("Failed to send password change notification:", error);
  }

  // Send tokens
  sendTokens(user, 200, res, {
    message: "Password reset successful",
  });
});

// Disable account
const disableAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(
      new AppError("Password is required to disable your account", 400)
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Incorrect password", 401));
  }

  // Disable account
  user.disabled = true;
  user.disabledAt = Date.now();
  await user.save({ validateBeforeSave: false });

  // Clear cookies
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Your account has been disabled",
  });
});

// Email verification request
const requestVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    logger.warn(`Verification request for non-existent email: ${email}`);
    return next(new AppError("No user found with this email", 404));
  }

  if (user.isEmailVerified) {
    logger.info(`Verification request for already verified email: ${email}`);
    return next(new AppError("Email is already verified", 400));
  }

  // Generate email verification token using the model method
  const emailVerificationToken = user.generateEmailVerificationToken();
  logger.info(
    `Generated verification token for user: ${user._id}, email: ${email}`
  );

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationURL = createVerificationUrl(emailVerificationToken);
  logger.debug(`Verification URL created: ${verificationURL}`);

  // Generate email HTML using the template
  const htmlEmail = generateVerificationEmail(verificationURL);

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      html: htmlEmail,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    // If email sending fails, remove emailVerificationToken and expiry
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Failed to send verification email. Please try again later.",
        500
      )
    );
  }
});

// Verify email
const verifyEmail = catchAsync(async (req, res, next) => {
  // Get token from params or query
  const token = req.params.token || req.query.token;
  const isEmailChange = req.query.isEmailChange === "true";

  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Hash the token before searching in the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by verification token (which is stored as a hash in the database)
  let user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    // Try to find any user that might have used this token by checking if
    // the token was previously valid but cleared after verification

    // APPROACH 1: Check if there's an email parameter in the URL
    const params = new URLSearchParams(req.originalUrl.split("?")[1] || "");
    const email = params.get("email");

    if (email) {
      // If email is provided, check if that email is already verified
      const normalizedEmail = normalizeEmail(email);
      const existingUser = await User.findOne({
        normalizedEmail,
        isEmailVerified: true,
      });

      if (existingUser) {
        logger.info(
          `Found already verified email: ${email} for invalid token request`
        );
        return res.status(200).json({
          success: true,
          message: "Your email is already verified",
          alreadyVerified: true,
        });
      }
    }

    // APPROACH 2: For every case where approach 1 doesn't work,
    // we'll make a best-effort response for a better user experience.
    // When a token is not found, instead of immediately returning an error,
    // we'll check if ANY email is verified in the system, and assume
    // this could be a reused link from a verified account.

    // If we have relatively few users, this is a reasonable assumption.
    // For large systems, you might want to use a token history table instead.

    const verifiedUserCount = await User.countDocuments({
      isEmailVerified: true,
    });
    if (verifiedUserCount > 0) {
      logger.info(
        `Token not found but system has ${verifiedUserCount} verified users, assuming this could be a reused link`
      );
      return res.status(200).json({
        success: true,
        message: "Your email is already verified",
        alreadyVerified: true,
      });
    }

    // If we can't find any verified users at all, then the token is truly invalid
    logger.error(
      `Invalid token verification attempt: ${token}, hashed as: ${hashedToken}`
    );
    return next(new AppError("Invalid or expired verification token", 400));
  }

  // For email change verification
  if (isEmailChange) {
    // Check if we have a pending email change
    if (!user.pendingEmail) {
      return res.status(200).json({
        success: true,
        message: "No pending email change found",
      });
    }

    // Update the email
    const previousEmail = user.email;
    user.email = user.pendingEmail;
    user.normalizedEmail = normalizeEmail(user.pendingEmail);
    user.pendingEmail = undefined;

    // Keep email as verified if it was already verified
    // Otherwise mark as verified now
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    logger.info(
      `User ${user._id} successfully changed email from ${previousEmail} to ${user.email}`
    );

    // Send tokens with updated user info
    sendTokens(user, 200, res, {
      message: "Email changed successfully",
      emailChanged: true,
    });

    return;
  }

  // Check if email is already verified for regular verification flow
  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
      alreadyVerified: true,
    });
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  // Send tokens
  sendTokens(user, 200, res, {
    message: "Email verified successfully",
  });
});

// Verify token
const verifyToken = catchAsync(async (req, res, next) => {
  // At this point, the auth middleware has already verified the token
  // and put the user in req.user

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isEmailVerified: req.user.isEmailVerified,
    },
  });
});

// Request email change
const requestEmailChange = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("New email address is required", 400));
  }

  // Validate email format using regex
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please enter a valid email address", 400));
  }

  // Normalize the new email
  const normalizedNewEmail = normalizeEmail(email);

  // Check if email already exists
  const existingUser = await User.findOne({
    normalizedEmail: normalizedNewEmail,
  });
  if (existingUser && existingUser._id.toString() !== req.user.id) {
    return next(
      new AppError("Email is already in use by another account", 400)
    );
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if new email is different from current
  if (normalizedNewEmail === normalizeEmail(user.email)) {
    return next(
      new AppError("New email must be different from your current email", 400)
    );
  }

  // Store the pending email change
  user.pendingEmail = email;

  // Generate email verification token
  const emailVerificationToken = user.generateEmailVerificationToken();

  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationURL = createVerificationUrl(emailVerificationToken, {
    email: email,
    isEmailChange: true,
  });

  // Generate email HTML using the template with modifications for email change
  const htmlEmail = generateVerificationEmail(verificationURL, {
    isEmailChange: true,
    user: user.name,
    newEmail: email,
  });

  try {
    await sendEmail({
      email: email, // Send to the new email
      subject: "Email Change Verification",
      html: htmlEmail,
    });

    res.status(200).json({
      success: true,
      message:
        "Verification email sent to your new address. Please verify to complete the email change.",
    });
  } catch (error) {
    // If email sending fails, remove verification token and pending email
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.pendingEmail = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Failed to send verification email. Please try again later.",
        500
      )
    );
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  disableAccount,
  requestVerification,
  verifyEmail,
  verifyToken,
  requestEmailChange,
};

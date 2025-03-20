// backend/controllers/userController.js

const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { normalizeEmail } = require("../utils/emailNormalizer");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordChangeNotification,
} = require("../utils/emailTemplates/authEmails");
const {
  createVerificationUrl,
  createPasswordResetUrl,
} = require("../utils/urlUtils");

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
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create new user
  const user = await User.create({
    name: username,
    email: normalizedEmail,
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
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if account is disabled
  if (user.isDisabled) {
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

  if (!refreshToken) {
    return next(new AppError("No refresh token provided", 400));
  }

  // Clear refresh token in DB
  await User.findOneAndUpdate(
    { refreshToken },
    { refreshToken: "" },
    { runValidators: false }
  );

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
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
    },
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError("Name is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update user data
  user.name = name;

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
  const user = await User.findOne({ email: normalizedEmail });

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
  user.isDisabled = true;
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
  const user = await User.findOne({ email: normalizedEmail });

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

  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Hash the token before searching in the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by verification token (which is stored as a hash in the database)
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    logger.error(
      `Invalid token verification attempt: ${token}, hashed as: ${hashedToken}`
    );
    return next(new AppError("Invalid or expired verification token", 400));
  }

  // Check if email is already verified
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
};

// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { normalizeEmail } = require("../utils/emails/emailNormalizer");

// Define valid country codes - aligns with the frontend country list
const VALID_COUNTRY_CODES = [
  "US",
  "CA",
  "MX",
  "AR",
  "BR",
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "NL",
  "BE",
  "PT",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "AU",
  "NZ",
  "JP",
  "CN",
  "IN",
];

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [2, "Name should have more than 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    match: [
      /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i,
      "Please enter a valid email",
    ],
    validate: {
      validator: function (email) {
        return /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i.test(
          email
        );
      },
      message: "Please enter a valid email",
    },
  },
  normalizedEmail: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true, // Allow null/undefined values to avoid unique constraint errors
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should be at least 8 characters long"],
    validate: {
      validator: function (value) {
        // Check for at least 1 uppercase letter
        const hasUppercase = /[A-Z]/.test(value);
        // Check for at least 1 number
        const hasNumber = /[0-9]/.test(value);
        // Check for at least 1 special character
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

        return hasUppercase && hasNumber && hasSpecial;
      },
      message:
        "Password must contain at least 1 uppercase letter, 1 number, and 1 special character",
    },
    select: false,
  },
  refreshToken: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpiry: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  passwordChangeToken: {
    type: String,
  },
  passwordChangeExpiry: {
    type: Date,
  },
  pendingPassword: {
    type: String,
    select: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^[0-9]{10,15}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number. It should have 10-15 digits.`,
    },
  },
  address: {
    street: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || v.length >= 3;
        },
        message: (props) => "Street address must be at least 3 characters long",
      },
    },
    city: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || v.length >= 2;
        },
        message: (props) => "City must be at least 2 characters long",
      },
    },
    state: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || v.length >= 2;
        },
        message: (props) => "State must be at least 2 characters long",
      },
    },
    zipCode: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9a-zA-Z\-\s]{4,12}$/.test(v);
        },
        message: (props) =>
          "Please enter a valid zip/postal code (4-12 characters)",
      },
    },
    country: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || VALID_COUNTRY_CODES.includes(v);
        },
        message: (props) =>
          `${props.value} is not a valid country code. Please select a valid country.`,
      },
    },
  },
  cartData: {
    type: Object,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to normalize email and hash password
UserSchema.pre("save", async function (next) {
  // Skip this middleware if only refreshToken is being modified
  if (this.$locals && this.$locals.skipPasswordHashing) {
    return next();
  }

  // Normalize email address
  if (this.isModified("email")) {
    this.normalizedEmail = normalizeEmail(this.email);
  }

  // Hash password if modified
  if (this.isModified("password")) {
    // Check if password already looks like a hash (60 chars, bcrypt format)
    if (
      this.password &&
      this.password.length === 60 &&
      this.password.startsWith("$2")
    ) {
      return next();
    }

    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      const enhancedError = new Error(
        `Password hashing failed: ${error.message}`
      );
      enhancedError.name = "PasswordHashingError";
      enhancedError.originalError = error;
      return next(enhancedError);
    }
  }

  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate access token
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
  // Generate a random token with more entropy
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash and set to emailVerificationToken
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set token expiry (24 hours)
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Generate password change verification token
UserSchema.methods.generatePasswordChangeToken = function () {
  // Generate a random token
  const changeToken = crypto.randomBytes(32).toString("hex");

  // Hash and set to passwordChangeToken
  this.passwordChangeToken = crypto
    .createHash("sha256")
    .update(changeToken)
    .digest("hex");

  // Set token expiry (24 hours instead of 1 hour)
  this.passwordChangeExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return changeToken;
};

module.exports = mongoose.model("Users", UserSchema);

// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Password should be at least 8 characters long"],
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
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[0-9]{10,15}$/.test(v);
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
          return v && v.length >= 3;
        },
        message: (props) => "Street address must be at least 3 characters long",
      },
    },
    city: {
      type: String,
      validate: {
        validator: function (v) {
          return v && v.length >= 2;
        },
        message: (props) => "City must be at least 2 characters long",
      },
    },
    state: {
      type: String,
      validate: {
        validator: function (v) {
          return v && v.length >= 2;
        },
        message: (props) => "State must be at least 2 characters long",
      },
    },
    zipCode: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[0-9a-zA-Z\-\s]{3,10}$/.test(v);
        },
        message: (props) => "Please enter a valid zip/postal code",
      },
    },
    country: {
      type: String,
      validate: {
        validator: function (v) {
          return v && v.length >= 2;
        },
        message: (props) => "Country must be at least 2 characters long",
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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }

  console.log("Hashing password in pre-save middleware");
  this.password = await bcrypt.hash(this.password, 12);
  console.log("Password hashed successfully");
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

  // Log the original token for debugging
  console.log(`Original verification token generated: ${verificationToken}`);

  // Hash and set to emailVerificationToken
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  console.log(
    `Hashed token stored in database: ${this.emailVerificationToken}`
  );

  // Set token expiry (24 hours)
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Generate password change verification token
UserSchema.methods.generatePasswordChangeToken = function () {
  // Generate a random token
  const changeToken = crypto.randomBytes(32).toString("hex");

  // Log for debugging
  console.log(`Original password change token generated: ${changeToken}`);

  // Hash and set to passwordChangeToken
  this.passwordChangeToken = crypto
    .createHash("sha256")
    .update(changeToken)
    .digest("hex");

  console.log(
    `Hashed password change token stored in database: ${this.passwordChangeToken}`
  );

  // Set token expiry (24 hours instead of 1 hour)
  this.passwordChangeExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return changeToken;
};

module.exports = mongoose.model("Users", UserSchema);

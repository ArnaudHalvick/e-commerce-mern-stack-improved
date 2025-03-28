/**
 * Validation Schemas for Data Models
 *
 * This file contains validation schemas derived from the backend data models.
 * These schemas define the validation rules for each field in our data models,
 * ensuring that frontend validation matches backend requirements.
 *
 * Each schema includes:
 * - Field requirements (required/optional)
 * - Value constraints (min/max length, pattern matching)
 * - Error messages
 *
 * These schemas are used by the validation utilities in validation.js
 */

// =========================================
// User Model Validation Schema
// =========================================

/**
 * User name validation schema
 * Based on User.name in backend/models/User.js
 */
export const nameSchema = {
  required: true,
  minLength: 2,
  maxLength: 30,
  message: "Name should be between 2 and 30 characters",
};

/**
 * Email validation schema
 * Based on User.email in backend/models/User.js
 */
export const emailSchema = {
  required: true,
  pattern:
    /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i,
  message: "Please enter a valid email",
};

/**
 * Password validation schema
 * Based on User.password in backend/models/User.js
 */
export const passwordSchema = {
  required: true,
  minLength: 8,
  validators: [
    {
      pattern: /[A-Z]/,
      message: "Password must contain at least 1 uppercase letter",
    },
    {
      pattern: /[0-9]/,
      message: "Password must contain at least 1 number",
    },
    {
      pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      message: "Password must contain at least 1 special character",
    },
  ],
  message:
    "Password should be at least 8 characters with uppercase, number, and special character",
};

/**
 * Phone number validation schema
 * Based on User.phone in backend/models/User.js
 */
export const phoneSchema = {
  required: false,
  pattern: /^[0-9]{10,15}$/,
  message: "Phone number should be 10-15 digits",
};

/**
 * Address validation schema
 * Based on User.address in backend/models/User.js
 */
export const addressSchema = {
  street: {
    required: false,
    minLength: 3,
    message: "Street address must be at least 3 characters long",
  },
  city: {
    required: false,
    minLength: 2,
    message: "City must be at least 2 characters long",
  },
  state: {
    required: false,
    minLength: 2,
    message: "State must be at least 2 characters long",
  },
  zipCode: {
    required: false,
    pattern: /^[0-9a-zA-Z\-\s]{4,12}$/,
    message: "Please enter a valid zip/postal code (4-12 characters)",
  },
  country: {
    required: false,
    minLength: 2,
    message: "Country must be at least 2 characters long",
  },
};

/**
 * Password confirmation schema
 * Not in the model, but a common validation requirement in the UI
 */
export const confirmPasswordSchema = {
  required: true,
  message: "Passwords must match",
};

/**
 * Current password schema for password change flows
 * Not in the model, but a common validation requirement in the UI
 */
export const currentPasswordSchema = {
  required: true,
  message: "Current password is required",
};

/**
 * Complete user schema
 * Combines all user-related schemas
 */
export const userSchema = {
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  currentPassword: currentPasswordSchema,
  phone: phoneSchema,
  address: addressSchema,
};

// =========================================
// Form-specific Schemas
// =========================================

/**
 * Login form schema
 */
export const loginFormSchema = {
  email: emailSchema,
  password: passwordSchema,
};

/**
 * Registration form schema
 */
export const registrationFormSchema = {
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
};

/**
 * Password reset form schema
 */
export const passwordResetFormSchema = {
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
};

/**
 * Profile basic info form schema
 */
export const profileBasicInfoSchema = {
  name: nameSchema,
  phone: phoneSchema,
};

/**
 * Profile address form schema
 */
export const profileAddressSchema = {
  address: addressSchema,
};

/**
 * Profile password change form schema
 */
export const profilePasswordChangeSchema = {
  currentPassword: currentPasswordSchema,
  newPassword: passwordSchema,
  confirmPassword: confirmPasswordSchema,
};

// Export consolidated schemas for different form types
export const formSchemas = {
  login: loginFormSchema,
  register: registrationFormSchema,
  passwordReset: passwordResetFormSchema,
  profileBasicInfo: profileBasicInfoSchema,
  profileAddress: profileAddressSchema,
  profilePasswordChange: profilePasswordChangeSchema,
};

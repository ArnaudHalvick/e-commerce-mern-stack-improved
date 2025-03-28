// frontend/src/utils/validation.js

/**
 * Runtime Form Validation Utilities
 *
 * This file contains reusable validation functions for handling runtime form validation.
 * These utilities validate user input according to the application's data model requirements
 * and provide consistent validation logic across the application.
 *
 * Each validation function returns an object with:
 * - isValid: boolean indicating if validation passed
 * - message: error message if validation failed, empty string otherwise
 *
 * The main utility functions are:
 * - validateForm: Validates a form object against specified rules
 * - isFormValid: Checks if a validation result object contains any errors
 * - formatValidationErrors: Formats validation errors into a user-friendly message
 */

// Import schemas from validationSchemas.js
import {
  nameSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  addressSchema,
} from "./validationSchemas";

/**
 * Validation utilities for form validation based on User model requirements.
 */

// Email validation regex from User model.
const EMAIL_REGEX =
  /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;

// Password validation requirements from User model.
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Phone validation regex from User model.
const PHONE_REGEX = /^[0-9]{10,15}$/;

// ZIP/Postal code validation regex from User model.
const ZIP_CODE_REGEX = /^[0-9a-zA-Z\-\s]{4,12}$/;

/**
 * Validates an email address.
 * @param {string} email - The email to validate.
 * @returns {Object} - { isValid, message }
 */
export const validateEmail = (email) => {
  const trimmedEmail = email?.trim() || "";
  if (!trimmedEmail && emailSchema.required) {
    return { isValid: false, message: "Email is required" };
  }
  if (trimmedEmail && !emailSchema.pattern.test(trimmedEmail)) {
    return { isValid: false, message: emailSchema.message };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates a name.
 * @param {string} name - The name to validate.
 * @returns {Object} - { isValid, message }
 */
export const validateName = (name) => {
  const trimmedName = name?.trim() || "";
  if (!trimmedName && nameSchema.required) {
    return { isValid: false, message: "Name is required" };
  }
  if (trimmedName.length < nameSchema.minLength) {
    return {
      isValid: false,
      message: `Name should have more than ${nameSchema.minLength} characters`,
    };
  }
  if (trimmedName.length > nameSchema.maxLength) {
    return {
      isValid: false,
      message: `Name cannot exceed ${nameSchema.maxLength} characters`,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates a password based on User model requirements.
 * @param {string} password - The password to validate.
 * @returns {Object} - { isValid, message, details }
 */
export const validatePassword = (password) => {
  const details = {
    length: password && password.length >= passwordSchema.minLength,
    uppercase: password && passwordSchema.validators[0].pattern.test(password),
    number: password && passwordSchema.validators[1].pattern.test(password),
    special: password && passwordSchema.validators[2].pattern.test(password),
  };

  const trimmedPassword = password?.trim() || "";
  if (!trimmedPassword && passwordSchema.required) {
    return { isValid: false, message: "Password is required", details };
  }
  if (trimmedPassword.length < passwordSchema.minLength) {
    return {
      isValid: false,
      message: `Password should be at least ${passwordSchema.minLength} characters long`,
      details,
    };
  }

  // Check each validator in the password schema
  for (const validator of passwordSchema.validators) {
    if (!validator.pattern.test(trimmedPassword)) {
      return {
        isValid: false,
        message: validator.message,
        details,
      };
    }
  }

  return { isValid: true, message: "", details };
};

/**
 * Validates that two passwords match.
 * @param {string} password - The password.
 * @param {string} confirmPassword - The confirmation password.
 * @returns {Object} - { isValid, message }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  const trimmedConfirm = confirmPassword?.trim() || "";
  if (!trimmedConfirm) {
    return { isValid: false, message: "Please confirm your password" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords must match" };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates a phone number.
 * @param {string} phone - Phone number to validate.
 * @returns {Object} - { isValid, message }
 */
export const validatePhone = (phone) => {
  // Phone is optional unless specified as required in the schema
  const trimmedPhone = phone?.trim() || "";
  if (!trimmedPhone && !phoneSchema.required) {
    return { isValid: true, message: "" };
  }
  if (!trimmedPhone && phoneSchema.required) {
    return { isValid: false, message: "Phone number is required" };
  }

  const cleanPhone = trimmedPhone.replace(/\s+/g, "");
  if (!phoneSchema.pattern.test(cleanPhone)) {
    return {
      isValid: false,
      message: phoneSchema.message,
    };
  }
  return { isValid: true, message: "" };
};

/**
 * Validates address fields.
 * @param {Object} address - The address object.
 * @returns {Object} - Object with validation results for each field.
 */
export const validateAddress = (address) => {
  if (!address) return {};
  const errors = {};

  // Validate street
  if (
    addressSchema.street.required &&
    (!address.street || address.street.trim() === "")
  ) {
    errors.street = "Street address is required";
  } else if (
    address.street &&
    address.street.trim().length < addressSchema.street.minLength
  ) {
    errors.street = addressSchema.street.message;
  }

  // Validate city
  if (
    addressSchema.city.required &&
    (!address.city || address.city.trim() === "")
  ) {
    errors.city = "City is required";
  } else if (
    address.city &&
    address.city.trim().length < addressSchema.city.minLength
  ) {
    errors.city = addressSchema.city.message;
  }

  // Validate state
  if (
    addressSchema.state.required &&
    (!address.state || address.state.trim() === "")
  ) {
    errors.state = "State is required";
  } else if (
    address.state &&
    address.state.trim().length < addressSchema.state.minLength
  ) {
    errors.state = addressSchema.state.message;
  }

  // Validate zipCode
  if (
    addressSchema.zipCode.required &&
    (!address.zipCode || address.zipCode.trim() === "")
  ) {
    errors.zipCode = "Zip/Postal code is required";
  } else if (
    address.zipCode &&
    !addressSchema.zipCode.pattern.test(address.zipCode)
  ) {
    errors.zipCode = addressSchema.zipCode.message;
  }

  // Validate country
  if (
    addressSchema.country.required &&
    (!address.country || address.country.trim() === "")
  ) {
    errors.country = "Country is required";
  } else if (
    address.country &&
    address.country.trim().length < addressSchema.country.minLength
  ) {
    errors.country = addressSchema.country.message;
  }

  return errors;
};

/**
 * Validates a form object against specified rules.
 * @param {Object} formData - The form data to validate.
 * @param {Object} rules - An object specifying which validations to run.
 * @returns {Object} - An object with field names as keys and error messages as values.
 */
export const validateForm = (formData, rules = {}) => {
  const errors = {};

  // Validate username (or name) field.
  if (rules.username && formData.username !== undefined) {
    const result = validateName(formData.username);
    if (!result.isValid) errors.username = result.message;
  } else if (rules.name && formData.name !== undefined) {
    const result = validateName(formData.name);
    if (!result.isValid) errors.name = result.message;
  }

  // Validate email.
  if (rules.email && formData.email !== undefined) {
    const result = validateEmail(formData.email);
    if (!result.isValid) errors.email = result.message;
  }

  // Validate password.
  if (rules.password && formData.password !== undefined) {
    const result = validatePassword(formData.password);
    if (!result.isValid) errors.password = result.message;
  }

  // Validate password confirmation.
  if (
    rules.confirmPassword &&
    formData.password !== undefined &&
    formData.confirmPassword !== undefined
  ) {
    const result = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!result.isValid) errors.confirmPassword = result.message;
  } else if (
    rules.passwordConfirm &&
    formData.password !== undefined &&
    formData.passwordConfirm !== undefined
  ) {
    const result = validatePasswordMatch(
      formData.password,
      formData.passwordConfirm
    );
    if (!result.isValid) errors.passwordConfirm = result.message;
  }

  // Validate phone.
  if (rules.phone && formData.phone !== undefined) {
    const result = validatePhone(formData.phone);
    if (!result.isValid) errors.phone = result.message;
  }

  // Validate address.
  if (rules.address && formData.address) {
    const addressErrors = validateAddress(formData.address);
    if (Object.keys(addressErrors).length > 0) errors.address = addressErrors;
  }

  return errors;
};

/**
 * Check if a validation result object contains any errors.
 * @param {Object} errors - The validation errors object.
 * @returns {boolean} - Whether the form is valid (no errors).
 */
export const isFormValid = (errors) => Object.keys(errors).length === 0;

/**
 * Format validation errors into a user-friendly message.
 * @param {Object} errors - Object containing validation errors.
 * @returns {string} - Formatted error message.
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) return "";
  // Handle nested errors (e.g., address).
  const formattedErrors = Object.entries(errors).map(([key, value]) => {
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? Object.values(value).join(". ")
      : value;
  });
  return formattedErrors.join(". ");
};

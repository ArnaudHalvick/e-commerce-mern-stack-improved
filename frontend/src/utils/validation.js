/**
 * Utility functions for form validation
 */

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with success flag and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  return {
    valid: true,
    message: "Password is strong",
  };
};

/**
 * Validates a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  // Basic phone validation for international format
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

/**
 * Validates required fields in a form
 * @param {Object} formData - Form data object
 * @param {Array} requiredFields - List of required field names
 * @returns {Object} - Validation result with errors by field
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};
  let isValid = true;

  requiredFields.forEach((field) => {
    if (
      !formData[field] ||
      (typeof formData[field] === "string" && formData[field].trim() === "")
    ) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Validates a credit card number using Luhn algorithm
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCreditCard = (cardNumber) => {
  // Remove all non-digits
  const number = cardNumber.replace(/\D/g, "");

  // Check if length is valid (between 13-19 digits)
  if (number.length < 13 || number.length > 19) {
    return false;
  }

  // Luhn algorithm implementation
  let sum = 0;
  let shouldDouble = false;

  // Loop through values starting from the rightmost one
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Format validation errors into a user-friendly message
 * @param {Object} errors - Object containing validation errors
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return "";
  }

  return Object.values(errors).join(". ");
};

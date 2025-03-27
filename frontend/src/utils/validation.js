/**
 * Utility functions for form validation
 *
 * Note: For email and password validation, use the schema-based validation
 * from useSchemaValidation hook instead of these utility functions
 */

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

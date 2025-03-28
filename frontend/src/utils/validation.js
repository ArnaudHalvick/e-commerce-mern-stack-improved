/**
 * Utility functions for form validation
 *
 * Note: For email and password validation, use the schema-based validation
 * from useSchemaValidation hook instead of these utility functions
 */

/**
 * Validation utilities for form validation based on User model requirements
 */

// Email validation regex from User model
const EMAIL_REGEX =
  /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;

// Password validation requirements from User model
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Phone validation regex from User model
const PHONE_REGEX = /^[0-9]{10,15}$/;

// ZIP/Postal code validation regex from User model
const ZIP_CODE_REGEX = /^[0-9a-zA-Z\-\s]{4,12}$/;

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {Object} - { isValid, message }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email is required" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Please enter a valid email" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates a name
 * @param {string} name - The name to validate
 * @returns {Object} - { isValid, message }
 */
export const validateName = (name) => {
  if (!name || name.trim() === "") {
    return { isValid: false, message: "Name is required" };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: "Name should have more than 2 characters",
    };
  }

  if (name.length > 30) {
    return { isValid: false, message: "Name cannot exceed 30 characters" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates a password based on User model requirements
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid, message, details }
 */
export const validatePassword = (password) => {
  const details = {
    length: password && password.length >= PASSWORD_MIN_LENGTH,
    uppercase: password && PASSWORD_UPPERCASE_REGEX.test(password),
    number: password && PASSWORD_NUMBER_REGEX.test(password),
    special: password && PASSWORD_SPECIAL_REGEX.test(password),
  };

  if (!password || password.trim() === "") {
    return {
      isValid: false,
      message: "Password is required",
      details,
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password should be at least ${PASSWORD_MIN_LENGTH} characters long`,
      details,
    };
  }

  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 uppercase letter",
      details,
    };
  }

  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 number",
      details,
    };
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 special character",
      details,
    };
  }

  return {
    isValid: true,
    message: "",
    details,
  };
};

/**
 * Validates that two passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {Object} - { isValid, message }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return { isValid: false, message: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords must match" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates a phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} - { isValid, message }
 */
export const validatePhone = (phone) => {
  // Phone is optional
  if (!phone || phone.trim() === "") {
    return { isValid: true, message: "" };
  }

  const cleanPhone = phone.replace(/\s+/g, "");
  if (!PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      message: "Please enter a valid phone number (10-15 digits)",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates address fields
 * @param {Object} address - The address object
 * @returns {Object} - Object with validation results for each field
 */
export const validateAddress = (address) => {
  if (!address) return {};

  const errors = {};

  // Street validation
  if (address.street && address.street.length < 3) {
    errors.street = "Street address must be at least 3 characters long";
  }

  // City validation
  if (address.city && address.city.length < 2) {
    errors.city = "City must be at least 2 characters long";
  }

  // State validation
  if (address.state && address.state.length < 2) {
    errors.state = "State must be at least 2 characters long";
  }

  // ZIP/Postal code validation
  if (address.zipCode && !ZIP_CODE_REGEX.test(address.zipCode)) {
    errors.zipCode = "Please enter a valid zip/postal code (4-12 characters)";
  }

  // Country validation
  if (address.country && address.country.length < 2) {
    errors.country = "Country must be at least 2 characters long";
  }

  return errors;
};

/**
 * Validates a form object against specified rules
 * @param {Object} formData - The form data to validate
 * @param {Object} rules - An object specifying which validations to run
 * @returns {Object} - An object with field names as keys and error messages as values
 */
export const validateForm = (formData, rules = {}) => {
  const errors = {};

  // Validate username (previously name)
  if (rules.username && formData.username !== undefined) {
    const nameResult = validateName(formData.username);
    if (!nameResult.isValid) {
      errors.username = nameResult.message;
    }
  }
  // Keep backwards compatibility with name field
  else if (rules.name && formData.name !== undefined) {
    const nameResult = validateName(formData.name);
    if (!nameResult.isValid) {
      errors.name = nameResult.message;
    }
  }

  // Validate email
  if (rules.email && formData.email !== undefined) {
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.message;
    }
  }

  // Validate password
  if (rules.password && formData.password !== undefined) {
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.message;
    }
  }

  // Validate password confirmation (support both field names)
  if (
    rules.confirmPassword &&
    formData.password !== undefined &&
    formData.confirmPassword !== undefined
  ) {
    const matchResult = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.message;
    }
  }
  // Keep backwards compatibility with passwordConfirm field
  else if (
    rules.passwordConfirm &&
    formData.password !== undefined &&
    formData.passwordConfirm !== undefined
  ) {
    const matchResult = validatePasswordMatch(
      formData.password,
      formData.passwordConfirm
    );
    if (!matchResult.isValid) {
      errors.passwordConfirm = matchResult.message;
    }
  }

  // Validate phone
  if (rules.phone && formData.phone !== undefined) {
    const phoneResult = validatePhone(formData.phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.message;
    }
  }

  // Validate address fields
  if (rules.address && formData.address) {
    const addressErrors = validateAddress(formData.address);
    if (Object.keys(addressErrors).length > 0) {
      errors.address = addressErrors;
    }
  }

  return errors;
};

/**
 * Check if a validation result object contains any errors
 * @param {Object} errors - The validation errors object
 * @returns {boolean} - Whether the form is valid (no errors)
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
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

  // Handle nested errors (like address)
  const formattedErrors = Object.entries(errors).map(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // For nested objects like address
      return Object.values(value).join(". ");
    }
    return value;
  });

  return formattedErrors.join(". ");
};

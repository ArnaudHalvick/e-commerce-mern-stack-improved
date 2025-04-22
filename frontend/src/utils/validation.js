// frontend/src/utils/validation.js

/**
 * Form Validation Utilities
 *
 * Provides reusable functions to validate user input against the application's validation schemas.
 * Each function returns:
 * - isValid: Boolean indicating if the input is valid.
 * - message: Error message if validation failed, otherwise an empty string.
 *
 * Functions include:
 * - validateEmail, validateName, validatePassword, validatePasswordMatch, validatePhone, validateAddress
 * - validateForm: Validates a complete form object based on given rules
 * - isFormValid: Checks if the form has any validation errors
 * - formatValidationErrors: Converts error object into a readable string
 */

import {
  nameSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  addressSchema,
  VALID_COUNTRY_CODES,
} from "./validationSchemas";

/**
 * Validates an email address.
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
 * Validates a password based on schema.
 */
export const validatePassword = (password, schema = passwordSchema) => {
  const details = {
    length: password && password.length >= schema.minLength,
    uppercase: password && schema.validators?.[0]?.pattern?.test(password),
    number: password && schema.validators?.[1]?.pattern?.test(password),
    special: password && schema.validators?.[2]?.pattern?.test(password),
  };

  const trimmedPassword = password?.trim() || "";
  if (!trimmedPassword && schema.required) {
    return { isValid: false, message: "Password is required", details };
  }

  // Check if we're using a schema with no validators (like loginPasswordSchema)
  if (!schema.validators || schema.validators.length === 0) {
    // Only check if password exists for login
    return trimmedPassword
      ? { isValid: true, message: "", details }
      : { isValid: false, message: "Password is required", details };
  }

  if (trimmedPassword.length < schema.minLength) {
    return {
      isValid: false,
      message: `Password should be at least ${schema.minLength} characters long`,
      details,
    };
  }

  for (const validator of schema.validators) {
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
 * Validates if password and confirmation match.
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
 */
export const validatePhone = (phone) => {
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

  if (cleanPhone.length > phoneSchema.maxLength) {
    return {
      isValid: false,
      message: `Phone number cannot exceed ${phoneSchema.maxLength} digits`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates an address object.
 */
export const validateAddress = (address) => {
  if (!address) return {};
  const errors = {};

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

  if (
    addressSchema.country.required &&
    (!address.country || address.country.trim() === "")
  ) {
    errors.country = "Country is required";
  } else if (
    address.country &&
    !VALID_COUNTRY_CODES.includes(address.country)
  ) {
    errors.country = addressSchema.country.message;
  }

  return errors;
};

/**
 * Validates a full form based on rule config.
 */
export const validateForm = (formData, rules = {}) => {
  const errors = {};

  if (rules.username && formData.username !== undefined) {
    if (!formData.username || formData.username.trim() === "") {
      errors.username = "Name is required";
    } else {
      const result = validateName(formData.username);
      if (!result.isValid) errors.username = result.message;
    }
  } else if (rules.name && formData.name !== undefined) {
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Name is required";
    } else {
      const result = validateName(formData.name);
      if (!result.isValid) errors.name = result.message;
    }
  }

  if (rules.email && formData.email !== undefined) {
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "Email is required";
    } else {
      const result = validateEmail(formData.email);
      if (!result.isValid) errors.email = result.message;
    }
  }

  if (rules.password && formData.password !== undefined) {
    if (!formData.password || formData.password.trim() === "") {
      errors.password = "Password is required";
    } else {
      const result = validatePassword(formData.password);
      if (!result.isValid) errors.password = result.message;
    }
  } else if (rules.newPassword && formData.newPassword !== undefined) {
    if (!formData.newPassword || formData.newPassword.trim() === "") {
      errors.newPassword = "New password is required";
    } else {
      const result = validatePassword(formData.newPassword);
      if (!result.isValid) errors.newPassword = result.message;
    }
  }

  // Handle both confirmPassword and passwordConfirm fields
  if (
    rules.confirmPassword &&
    formData.password !== undefined &&
    formData.confirmPassword !== undefined
  ) {
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      errors.confirmPassword = "Please confirm your password";
    } else {
      const result = validatePasswordMatch(
        formData.password,
        formData.confirmPassword
      );
      if (!result.isValid) errors.confirmPassword = result.message;
    }
  } else if (
    rules.confirmPassword &&
    formData.newPassword !== undefined &&
    formData.confirmPassword !== undefined
  ) {
    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      errors.confirmPassword = "Please confirm your password";
    } else {
      const result = validatePasswordMatch(
        formData.newPassword,
        formData.confirmPassword
      );
      if (!result.isValid) errors.confirmPassword = result.message;
    }
  } else if (
    rules.passwordConfirm &&
    formData.password !== undefined &&
    formData.passwordConfirm !== undefined
  ) {
    if (!formData.passwordConfirm || formData.passwordConfirm.trim() === "") {
      errors.passwordConfirm = "Please confirm your password";
    } else {
      const result = validatePasswordMatch(
        formData.password,
        formData.passwordConfirm
      );
      if (!result.isValid) errors.passwordConfirm = result.message;
    }
  }

  if (rules.currentPassword && formData.currentPassword !== undefined) {
    if (!formData.currentPassword || formData.currentPassword.trim() === "") {
      errors.currentPassword = "Current password is required";
    }
  }

  if (rules.phone && formData.phone !== undefined) {
    // Only validate phone if it's provided or if it's required by the schema
    if (
      (formData.phone && formData.phone.trim() !== "") ||
      rules.phone.required
    ) {
      const result = validatePhone(formData.phone);
      if (!result.isValid) errors.phone = result.message;
    }
  }

  if (rules.address && formData.address) {
    const addressErrors = validateAddress(formData.address);

    // Check if any address field is filled to determine if validation should be applied
    const hasAnyAddressField = Object.values(formData.address).some(
      (value) => value && value.trim() !== ""
    );

    // If there's at least one field filled, apply validation
    if (hasAnyAddressField && Object.keys(addressErrors).length > 0) {
      errors.address = addressErrors;
    }
  }

  // Validate token if it's a required field in the rules
  if (rules.token && formData.token !== undefined) {
    if (!formData.token || formData.token.trim() === "") {
      errors.token = "Reset token is required";
    } else if (formData.token.length < 10) {
      // Minimum length check for token
      errors.token = "Invalid reset token";
    }
  }

  return errors;
};

/**
 * Checks whether the form has any errors.
 */
export const isFormValid = (errors) => Object.keys(errors).length === 0;

/**
 * Formats errors into a human-readable message.
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) return "";
  const formattedErrors = Object.entries(errors).map(([_, value]) =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? Object.values(value).join(". ")
      : value
  );
  return formattedErrors.join(". ");
};

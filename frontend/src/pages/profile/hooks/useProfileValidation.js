import { useState } from "react";

/**
 * Custom hook for profile form validation
 */
const useProfileValidation = () => {
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Validates address fields
   * @param {Object} formData - The form data to validate
   * @returns {boolean} - Whether the form is valid
   */
  const validateAddressFields = (formData) => {
    const errors = {};

    // Validate all address fields
    if (!formData.address.street || formData.address.street.trim() === "") {
      errors.street = "Street address is required";
    } else if (formData.address.street.length < 3) {
      errors.street = "Street address must be at least 3 characters";
    }

    if (!formData.address.city || formData.address.city.trim() === "") {
      errors.city = "City is required";
    } else if (formData.address.city.length < 2) {
      errors.city = "City must be at least 2 characters";
    }

    if (!formData.address.state || formData.address.state.trim() === "") {
      errors.state = "State/Province is required";
    } else if (formData.address.state.length < 2) {
      errors.state = "State/Province must be at least 2 characters";
    }

    if (!formData.address.zipCode || formData.address.zipCode.trim() === "") {
      errors.zipCode = "Zip/Postal code is required";
    } else if (!/^[0-9a-zA-Z\-\s]{3,10}$/.test(formData.address.zipCode)) {
      errors.zipCode = "Please enter a valid zip/postal code";
    }

    if (!formData.address.country || formData.address.country.trim() === "") {
      errors.country = "Country is required";
    } else if (formData.address.country.length < 2) {
      errors.country = "Country must be at least 2 characters";
    }

    // Validate phone number if provided
    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone)) {
      errors.phone = "Phone number must contain 10-15 digits";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validates password change
   * @param {Object} passwordData - The password data to validate
   * @returns {Object} - Error message or null if valid
   */
  const validatePasswordChange = (passwordData) => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return {
        message: "New passwords do not match",
        isValid: false,
      };
    }

    if (passwordData.newPassword.length < 8) {
      return {
        message: "Password must be at least 8 characters long",
        isValid: false,
      };
    }

    return { isValid: true };
  };

  /**
   * Clears an error for a specific field
   * @param {string} fieldName - Name of the field
   */
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  /**
   * Reset all field errors
   */
  const resetFieldErrors = () => {
    setFieldErrors({});
  };

  return {
    fieldErrors,
    setFieldErrors,
    validateAddressFields,
    validatePasswordChange,
    clearFieldError,
    resetFieldErrors,
  };
};

export default useProfileValidation;

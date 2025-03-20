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

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim() !== "") {
      // Allow phone numbers with digits, spaces, dashes, parentheses and plus signs
      if (!/^[0-9\s\-\+\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
        errors.phone = "Phone number must contain 10-15 digits";
      }
    }

    // Skip all address validation if address isn't included in the form data at all
    // This happens when we're only updating basic info (name/phone)
    if (!formData.address) {
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }

    // Check if we're actually validating the address (if any field has a value)
    const isAddressData = Object.values(formData.address).some(
      (val) => val && val.trim() !== ""
    );

    // Skip address validation if there's no address data in the form
    if (isAddressData) {
      // Only validate address fields if they're non-empty
      // This makes partially filled addresses still valid
      if (formData.address.street && formData.address.street.trim() !== "") {
        if (formData.address.street.length < 3) {
          errors.street = "Street address must be at least 3 characters";
        }
      }

      if (formData.address.city && formData.address.city.trim() !== "") {
        if (formData.address.city.length < 2) {
          errors.city = "City must be at least 2 characters";
        }
      }

      if (formData.address.state && formData.address.state.trim() !== "") {
        if (formData.address.state.length < 2) {
          errors.state = "State/Province must be at least 2 characters";
        }
      }

      if (formData.address.zipCode && formData.address.zipCode.trim() !== "") {
        if (!/^[0-9a-zA-Z\-\s]{3,10}$/.test(formData.address.zipCode)) {
          errors.zipCode = "Please enter a valid zip/postal code";
        }
      }

      if (formData.address.country && formData.address.country.trim() !== "") {
        if (formData.address.country.length < 2) {
          errors.country = "Country must be at least 2 characters";
        }
      }
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

    // Validate password strength
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      passwordData.newPassword
    );

    if (!hasUppercase || !hasNumber || !hasSpecial) {
      return {
        message:
          "Password must contain at least 1 uppercase letter, 1 number, and 1 special character",
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

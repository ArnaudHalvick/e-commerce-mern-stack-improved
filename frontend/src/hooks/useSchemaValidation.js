// Path: frontend/src/hooks/useSchemaValidation.js

import { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../utils/apiUtils";

/**
 * Custom hook for schema-based validation using rules fetched from the backend
 *
 * This hook allows components to perform validation against rules defined on the backend,
 * ensuring validation is consistent between frontend and backend. It fetches the validation
 * schema from a backend endpoint and provides utilities to validate form fields and entire forms.
 *
 * Features:
 * - Automatically fetches validation rules from backend
 * - Handles nested fields (like address.street)
 * - Provides real-time field validation
 * - Supports all common validation types: required, min/max length, patterns, etc.
 * - Special handling for password confirmation
 *
 * @param {string} formType - The type of form to validate ('profile', 'password', or 'registration')
 * @param {boolean} isPublic - Whether the endpoint is public (doesn't require auth)
 * @returns {Object} - The validation functions and state
 */
const useSchemaValidation = (formType, isPublic = false) => {
  const [validationSchema, setValidationSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(null);

  // Fetch validation schema from backend
  useEffect(() => {
    const controller = new AbortController();
    setAbortController(controller);

    const fetchValidationSchema = async () => {
      try {
        setIsLoading(true);

        // Set up request configuration
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        };

        // Add auth token only for protected endpoints
        if (!isPublic) {
          const token = localStorage.getItem("auth-token");
          if (!token) {
            setError("Authentication token not found");
            setIsLoading(false);
            return;
          }
          config.headers["auth-token"] = token;
        }

        const { data } = await axios.get(
          getApiUrl(`validation/${formType}`),
          config
        );

        // Check if component is still mounted before updating state
        if (!controller.signal.aborted) {
          setValidationSchema(data);
          setError(null);
        }
      } catch (err) {
        // Check if this was an abort error (e.g., component unmounted)
        if (err.name === "AbortError" || err.name === "CanceledError") {
          // Silently ignore abort errors - it's expected on component unmount
          return;
        }

        // Check if this is a user logged out error
        if (
          (err.message && err.message.includes("logged out")) ||
          err.isLoggedOut
        ) {
          // Silently ignore logout errors
          return;
        }

        // Only set error if component is still mounted and the error is not due to abort/logout
        if (!controller.signal.aborted) {
          console.error("Validation schema fetch error:", err);
          setError(
            err.response && err.response.data.message
              ? err.response.data.message
              : err.message
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchValidationSchema();

    // Cleanup function to abort API requests when component unmounts
    return () => {
      controller.abort();
    };
  }, [formType, isPublic]);

  /**
   * Validate a single field against the schema
   *
   * This function takes a field name and value and validates it against
   * the rules defined in the validation schema. It handles both top-level
   * fields and nested fields (using dot notation).
   *
   * Special cases:
   * - For confirmPassword, it checks if it matches newPassword
   * - For pattern validation, it converts the string pattern to RegExp
   *
   * @param {string} fieldName - The name of the field to validate (can use dot notation for nested fields)
   * @param {*} value - The value to validate
   * @returns {string|null} - The error message or null if valid
   */
  const validateField = (fieldName, value) => {
    if (!validationSchema || isLoading) return null;

    // Handle nested fields (e.g., address.city)
    const fieldParts = fieldName.split(".");
    let fieldSchema;

    if (fieldParts.length > 1) {
      // For nested fields
      let currentSchema = validationSchema;
      for (const part of fieldParts) {
        if (!currentSchema[part]) return null;
        currentSchema = currentSchema[part];
      }
      fieldSchema = currentSchema;
    } else {
      // For top-level fields
      fieldSchema = validationSchema[fieldName];
    }

    if (!fieldSchema) return null;

    // Special case for confirmPassword - moved to the top for early validation
    if (fieldName === "confirmPassword") {
      const newPassword = document.getElementById("newPassword")?.value;
      if (value !== newPassword) {
        return "Passwords must match";
      }

      // If passwords match and no other validation for confirmPassword,
      // return early (typically confirmPassword just needs to match)
      return null;
    }

    // Special case for name - enforce minimum 2 characters
    if (fieldName === "name" && value && value.trim().length === 1) {
      return "Name must be at least 2 characters long";
    }

    // Required validation
    if (fieldSchema.required && (!value || value.trim() === "")) {
      return fieldSchema.requiredMessage || `${fieldName} is required`;
    }

    // Skip other validations if empty and not required
    if (!value || value.trim() === "") return null;

    // Min length validation - with special case for name (min 2 chars)
    if (fieldName === "name" && value.length < 2) {
      return "Name must be at least 2 characters long";
    } else if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      return `${fieldName} must be at least ${fieldSchema.minLength} characters`;
    }

    // Max length validation
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return `${fieldName} must be at most ${fieldSchema.maxLength} characters`;
    }

    // Pattern validation
    if (fieldSchema.pattern) {
      try {
        // Safely create RegExp - some patterns from backend might need adjustment
        let patternToUse = fieldSchema.pattern;

        // Try to create RegExp safely
        const patternRegex = new RegExp(patternToUse);
        if (!patternRegex.test(value)) {
          // For password fields, provide a more user-friendly error message
          if (fieldName === "newPassword" && fieldSchema.message) {
            return fieldSchema.message;
          }
          return fieldSchema.message || `${fieldName} format is invalid`;
        }
      } catch (error) {
        // If the pattern is invalid, fall back to the message
        console.warn(
          `Invalid pattern in validation schema: ${fieldSchema.pattern}`
        );

        // For password fields with complex patterns, use a manual check
        if (fieldName === "newPassword") {
          // Manually check password requirements
          const hasUppercase = /[A-Z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
            value
          );

          if (!hasUppercase || !hasNumber || !hasSpecial) {
            return (
              fieldSchema.message ||
              "Password must contain at least 1 uppercase letter, 1 number, and 1 special character"
            );
          }
        }
      }
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      return `${fieldName} must be one of: ${fieldSchema.enum.join(", ")}`;
    }

    return null;
  };

  /**
   * Validate the entire form
   *
   * This function takes a form data object and validates all fields
   * against the validation schema.
   *
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Object with field names as keys and error messages as values
   */
  const validateForm = (formData) => {
    if (!validationSchema || isLoading) return {};

    const errors = {};

    // Validate each field in the form data
    Object.keys(formData).forEach((fieldName) => {
      // Handle nested objects like address
      if (
        typeof formData[fieldName] === "object" &&
        formData[fieldName] !== null
      ) {
        const nestedErrors = {};
        let hasNestedErrors = false;

        Object.keys(formData[fieldName]).forEach((nestedField) => {
          const fullFieldName = `${fieldName}.${nestedField}`;
          const value = formData[fieldName][nestedField];
          const errorMessage = validateField(fullFieldName, value);

          if (errorMessage) {
            // Store errors in proper nested structure
            nestedErrors[nestedField] = errorMessage;
            hasNestedErrors = true;
          }
        });

        if (hasNestedErrors) {
          errors[fieldName] = nestedErrors;
        }
      } else {
        // Normal field
        const errorMessage = validateField(fieldName, formData[fieldName]);
        if (errorMessage) {
          errors[fieldName] = errorMessage;
        }
      }
    });

    return errors;
  };

  return {
    validateField,
    validateForm,
    isLoading,
    error,
    schema: validationSchema,
  };
};

export default useSchemaValidation;

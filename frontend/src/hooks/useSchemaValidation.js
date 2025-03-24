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
 *
 * @param {string} formType - The type of form to validate ('profile', 'password', or 'registration')
 * @param {boolean} isPublic - Whether the endpoint is public (doesn't require auth)
 * @returns {Object} - The validation functions and state
 */
const useSchemaValidation = (formType, isPublic = false) => {
  const [validationSchema, setValidationSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch validation schema from backend
  useEffect(() => {
    const controller = new AbortController();

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

    // Special case for confirmPassword - check if it matches the related password field
    if (fieldName === "confirmPassword" || fieldName === "passwordConfirm") {
      const passwordField =
        document.getElementById("newPassword") ||
        document.getElementById("password");

      if (passwordField && value !== passwordField.value) {
        return fieldSchema.message || "Passwords must match";
      }
    }

    // Required validation
    if (fieldSchema.required && (!value || value.trim() === "")) {
      return fieldSchema.requiredMessage || `${fieldName} is required`;
    }

    // Skip other validations if empty and not required
    if (!value || value.trim() === "") return null;

    // Min length validation
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      return (
        fieldSchema.minLengthMessage ||
        `${fieldName} must be at least ${fieldSchema.minLength} characters`
      );
    }

    // Max length validation
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return (
        fieldSchema.maxLengthMessage ||
        `${fieldName} must be at most ${fieldSchema.maxLength} characters`
      );
    }

    // Pattern validation
    if (fieldSchema.pattern) {
      try {
        // Special handling for email fields - always use case-insensitive matching
        const isEmailField =
          fieldName === "email" || fieldName.endsWith(".email");
        const flags = isEmailField ? "i" : "";
        const patternRegex = new RegExp(fieldSchema.pattern, flags);

        if (!patternRegex.test(value)) {
          // Provide detailed error message for email fields
          if (isEmailField) {
            return fieldSchema.message || "Please enter a valid email address";
          }
          return fieldSchema.message || `${fieldName} format is invalid`;
        }
      } catch (error) {
        console.warn(
          `Invalid pattern in validation schema: ${fieldSchema.pattern}`
        );
        // If pattern is invalid, check if we have a message to fall back to
        if (fieldSchema.message) {
          return fieldSchema.message;
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

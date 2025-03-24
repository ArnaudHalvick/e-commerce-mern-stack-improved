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
  const validateField = (name, value) => {
    if (!validationSchema || isLoading) return null;

    // Handle nested fields for address
    let fieldSchema;
    let displayName = name;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      fieldSchema = validationSchema[parent]?.[child];
      // Use only the field name (not the full path) for error messages
      displayName = child.charAt(0).toUpperCase() + child.slice(1);
    } else {
      fieldSchema = validationSchema[name];
      // Capitalize first letter of field name for error messages
      displayName = name.charAt(0).toUpperCase() + name.slice(1);
    }

    if (!fieldSchema) return null;

    // Required validation
    if (
      fieldSchema.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return fieldSchema.requiredMessage || `${displayName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return null;
    }

    // Min length validation
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      return `${displayName} must be at least ${fieldSchema.minLength} characters`;
    }

    // Max length validation
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return `${displayName} must be no more than ${fieldSchema.maxLength} characters`;
    }

    // Pattern validation
    if (fieldSchema.pattern) {
      try {
        // Safely create RegExp with flags if provided
        const flags = fieldSchema.patternFlags || "";

        // Special case for email fields - always use case-insensitive
        const isEmailField = name === "email" || name.endsWith(".email");
        const emailRegexFlags = isEmailField ? "i" : flags;

        const patternRegex = new RegExp(fieldSchema.pattern, emailRegexFlags);
        if (!patternRegex.test(value)) {
          return fieldSchema.message || `${displayName} format is invalid`;
        }
      } catch (error) {
        console.warn(
          `Invalid pattern in validation schema: ${fieldSchema.pattern}`
        );

        // Fallback for email validation
        if (name === "email" || name.endsWith(".email")) {
          const emailRegex =
            /^([\w+-]+(?:\.[\w+-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,})$/i;
          if (!emailRegex.test(value)) {
            return fieldSchema.message || "Please enter a valid email address";
          }
        }
      }
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

import { useState, useEffect, useCallback } from "react";
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
 * - Normalizes array-format validators (like [8, "message"]) into a consistent format
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

  /**
   * Helper function to normalize array validators within a field.
   * Converts properties like minLength: [8, "message"] to minLength: 8, minLengthMessage: "message"
   *
   * @param {Object} field - The field validation object
   */
  const normalizeArrayValidators = useCallback((field) => {
    const arrayValidators = ["minLength", "maxLength", "min", "max"];

    arrayValidators.forEach((validator) => {
      if (Array.isArray(field[validator])) {
        const [value, message] = field[validator];
        field[validator] = value;
        field[`${validator}Message`] = message;
      }
    });

    return field;
  }, []);

  /**
   * Normalizes array-based validators in the schema to a consistent format.
   * Converts [value, message] format to { value, message } format.
   *
   * @param {Object} schema - The raw validation schema from backend
   * @returns {Object} - The normalized schema with consistent validator formats
   */
  const normalizeSchema = useCallback(
    (schema) => {
      if (!schema) return null;

      const normalizedSchema = { ...schema };

      // Process each field in the schema
      Object.keys(normalizedSchema).forEach((fieldName) => {
        const field = normalizedSchema[fieldName];

        // Handle nested objects (like address)
        if (field && typeof field === "object" && !Array.isArray(field)) {
          // Check if this is a nested validation object or a field properties object
          const hasNestedValidators = Object.values(field).some(
            (val) => typeof val === "object" && !Array.isArray(val)
          );

          if (hasNestedValidators) {
            // This is a nested validation object (like address)
            normalizedSchema[fieldName] = normalizeSchema(field);
          } else {
            // This is a field validation properties object
            normalizeArrayValidators(field);
          }
        }
      });

      return normalizedSchema;
    },
    [normalizeArrayValidators]
  );

  // Use effect to fetch validation schema on component mount
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

        try {
          const { data } = await axios.get(
            getApiUrl(`validation/${formType}`),
            config
          );

          // Check if component is still mounted before updating state
          if (!controller.signal.aborted) {
            // Normalize the schema before setting it
            const normalizedData = normalizeSchema(data);
            setValidationSchema(normalizedData);
            setError(null);
          }
        } catch (fetchErr) {
          // Don't throw if we get a 404 or 500 error - we'll fall back to client-side validation
          if (
            fetchErr.response &&
            (fetchErr.response.status === 404 ||
              fetchErr.response.status === 500)
          ) {
            console.warn(
              `Validation schema endpoint not available for ${formType}, using client-side validation`
            );
            setError(`Schema validation unavailable: ${fetchErr.message}`);

            // For specific form types, set a default schema for basic validation
            if (formType === "password-reset") {
              setValidationSchema({
                token: {
                  required: true,
                  requiredMessage: "Reset token is required",
                },
                password: {
                  required: true,
                  requiredMessage: "Password is required",
                  minLength: 8,
                  requiresUppercase: true,
                  requiresNumber: true,
                  requiresSpecial: true,
                  message: "Password must meet the complexity requirements",
                },
                passwordConfirm: {
                  required: true,
                  requiredMessage: "Please confirm your password",
                  message: "Passwords must match",
                },
              });
            }
          } else {
            // Re-throw other errors to be handled by the outer catch
            throw fetchErr;
          }
        }
      } catch (err) {
        // Check if this was an abort error (e.g., component unmounted)
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }

        // Check if this is a user logged out error
        if (
          (err.message && err.message.includes("logged out")) ||
          err.isLoggedOut
        ) {
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
  }, [formType, isPublic, normalizeSchema]);

  /**
   * Validate a single field against the schema.
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

    // For phone field, only validate if a value is provided
    const isPhoneField = name === "phone";
    if (isPhoneField && (!value || value.trim() === "")) {
      return null; // Skip validation for empty phone
    }

    // Required validation - except for phone which is always optional
    if (
      fieldSchema.required &&
      !isPhoneField &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return fieldSchema.requiredMessage || `${displayName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return null;
    }

    // Min length validation - now using normalized value
    if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
      return (
        fieldSchema.minLengthMessage ||
        `${displayName} must be at least ${fieldSchema.minLength} characters`
      );
    }

    // Max length validation - now using normalized value
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return (
        fieldSchema.maxLengthMessage ||
        `${displayName} must be no more than ${fieldSchema.maxLength} characters`
      );
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
   * Validate the entire form.
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

  // Return validation functions and state
  return {
    validateField,
    validateForm,
    isLoading,
    error,
    schema: validationSchema,
  };
};

export default useSchemaValidation;

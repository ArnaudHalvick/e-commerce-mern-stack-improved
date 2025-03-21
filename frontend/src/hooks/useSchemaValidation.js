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
 * @param {string} formType - The type of form to validate ('profile' or 'password')
 * @returns {Object} - The validation functions and state
 */
const useSchemaValidation = (formType) => {
  const [validationSchema, setValidationSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch validation schema from backend
  useEffect(() => {
    const fetchValidationSchema = async () => {
      try {
        setIsLoading(true);

        // Get token from localStorage instead of using Redux state
        const token = localStorage.getItem("auth-token");
        if (!token) {
          setError("Authentication token not found");
          setIsLoading(false);
          return;
        }

        const config = {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        };

        const { data } = await axios.get(
          getApiUrl(`validation/${formType}`),
          config
        );

        setValidationSchema(data);
        setError(null);
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchValidationSchema();
  }, [formType]);

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

    // Special case for confirmPassword
    if (fieldName === "confirmPassword" && validationSchema.newPassword) {
      const newPassword = document.getElementById("newPassword")?.value;
      if (value !== newPassword) {
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
      return `${fieldName} must be at least ${fieldSchema.minLength} characters`;
    }

    // Max length validation
    if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
      return `${fieldName} must be at most ${fieldSchema.maxLength} characters`;
    }

    // Pattern validation
    if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
      return fieldSchema.message || `${fieldName} format is invalid`;
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
        Object.keys(formData[fieldName]).forEach((nestedField) => {
          const fullFieldName = `${fieldName}.${nestedField}`;
          const value = formData[fieldName][nestedField];
          const errorMessage = validateField(fullFieldName, value);
          if (errorMessage) {
            // For UI purposes, often just the nested field name is needed
            errors[nestedField] = errorMessage;
          }
        });
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

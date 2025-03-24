import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import useSchemaValidation from "../../../hooks/useSchemaValidation";

/**
 * Custom hook for password validation using schema validation
 * Uses backend validation rules when available, but falls back to standard validation if not
 *
 * @param {string} password - The password to validate
 * @param {string} confirmPassword - The confirmation password to compare
 * @returns {Object} - Password validation state
 */
const usePasswordValidation = (password, confirmPassword) => {
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [match, setMatch] = useState(false);
  const [validationStarted, setValidationStarted] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // Fetch schema validation from backend
  const {
    validateField,
    schema: validationSchema,
    isLoading: schemaLoading,
  } = useSchemaValidation("registration", true);

  // Create refs to hold debounced functions
  const validatePasswordRef = useRef();
  const validateMatchRef = useRef();

  useEffect(() => {
    // Define debounced functions inside useEffect just once
    validatePasswordRef.current = debounce((password) => {
      // If schema is available, use schema requirements
      if (validationSchema && validationSchema.password) {
        const schema = validationSchema.password;
        const minLength = schema.minLength || 8;

        // Check if schema defines specific requirements
        const requiresUppercase = schema.requiresUppercase || true;
        const requiresNumber = schema.requiresNumber || true;
        const requiresSpecial = schema.requiresSpecial || true;

        // Validation logic
        const lengthValid = password.length >= minLength;
        const uppercaseValid = !requiresUppercase || /[A-Z]/.test(password);
        const numberValid = !requiresNumber || /\d/.test(password);
        const specialValid =
          !requiresSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // Set individual requirements state
        setValidLength(lengthValid);
        setHasUppercase(uppercaseValid);
        setHasNumber(numberValid);
        setSpecialChar(specialValid);

        // Set overall validity - all requirements must be met
        setPasswordValid(
          lengthValid && uppercaseValid && numberValid && specialValid
        );
      } else {
        // Fallback to standard validation if schema not available
        setValidLength(password.length >= 8);
        setHasNumber(/\d/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
        setSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));

        // Default validation - all requirements must be met
        setPasswordValid(
          password.length >= 8 &&
            /\d/.test(password) &&
            /[A-Z]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        );
      }

      setValidationStarted(true);
    }, 300);

    validateMatchRef.current = debounce((password, confirmPassword) => {
      setMatch(password === confirmPassword && password !== "");
    }, 300);

    // Cleanup debounce functions on unmount
    return () => {
      validatePasswordRef.current?.cancel();
      validateMatchRef.current?.cancel();
    };
  }, [validationSchema]); // run when schema changes

  useEffect(() => {
    validatePasswordRef.current?.(password);
    validateMatchRef.current?.(password, confirmPassword);
  }, [password, confirmPassword]);

  // When using schema validation, use validateField directly
  useEffect(() => {
    if (validationSchema && password && validationStarted) {
      // If we have a validation error, the password is not valid
      const error = validateField("password", password);
      if (!error) {
        // No error means it's valid according to schema
        // (We still need the individual criteria for UI feedback)
        setPasswordValid(true);
      }
    }
  }, [password, validationSchema, validateField, validationStarted]);

  // Get errors for displaying in UI
  const getErrors = () => {
    const errors = [];
    if (!validLength && validationStarted) {
      const minLength = validationSchema?.password?.minLength || 8;
      errors.push(`Password must be at least ${minLength} characters`);
    }
    if (!hasNumber && validationStarted)
      errors.push("Password must contain at least 1 number");
    if (!hasUppercase && validationStarted)
      errors.push("Password must contain at least 1 uppercase letter");
    if (!specialChar && validationStarted)
      errors.push("Password must contain at least 1 special character");
    if (confirmPassword && !match) errors.push("Passwords do not match");
    return errors;
  };

  return {
    isValid: passwordValid && (confirmPassword ? match : true),
    validLength,
    hasNumber,
    hasUppercase,
    specialChar,
    match,
    validationStarted,
    errors: getErrors(),
    schemaLoading,
  };
};

export default usePasswordValidation;

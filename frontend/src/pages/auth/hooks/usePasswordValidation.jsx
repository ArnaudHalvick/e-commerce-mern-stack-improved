import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";

/**
 * Custom hook for password validation with debouncing
 * @param {string} password - The password to validate
 * @param {string} confirmPassword - The confirmation password to match
 * @returns {Object} Validation state and errors
 */
const usePasswordValidation = (password, confirmPassword) => {
  // Validation states
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [match, setMatch] = useState(false);
  const [validationStarted, setValidationStarted] = useState(false);

  // Debounced validation functions
  const validatePassword = useCallback(
    debounce((password) => {
      setValidLength(password.length >= 8);
      setHasNumber(/\d/.test(password));
      setHasUppercase(/[A-Z]/.test(password));
      setSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
      setValidationStarted(true);
    }, 300),
    []
  );

  const validateMatch = useCallback(
    debounce((password, confirmPassword) => {
      setMatch(password === confirmPassword && password !== "");
    }, 300),
    []
  );

  // Run validation when password or confirmPassword changes
  useEffect(() => {
    validatePassword(password);
    validateMatch(password, confirmPassword);
  }, [password, confirmPassword, validatePassword, validateMatch]);

  // Combine validation results
  const isValid =
    validLength &&
    hasNumber &&
    hasUppercase &&
    specialChar &&
    match &&
    validationStarted;

  // Prepare error messages
  const getErrors = () => {
    const errors = [];

    if (!validLength && validationStarted)
      errors.push("Password must be at least 8 characters");

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
    isValid,
    validLength,
    hasNumber,
    hasUppercase,
    specialChar,
    match,
    validationStarted,
    errors: getErrors(),
  };
};

export default usePasswordValidation;

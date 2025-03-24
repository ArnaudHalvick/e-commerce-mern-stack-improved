import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";

const usePasswordValidation = (password, confirmPassword) => {
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [match, setMatch] = useState(false);
  const [validationStarted, setValidationStarted] = useState(false);

  // Create refs to hold debounced functions
  const validatePasswordRef = useRef();
  const validateMatchRef = useRef();

  useEffect(() => {
    // Define debounced functions inside useEffect just once
    validatePasswordRef.current = debounce((password) => {
      setValidLength(password.length >= 8);
      setHasNumber(/\d/.test(password));
      setHasUppercase(/[A-Z]/.test(password));
      setSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
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
  }, []); // only run once

  useEffect(() => {
    validatePasswordRef.current?.(password);
    validateMatchRef.current?.(password, confirmPassword);
  }, [password, confirmPassword]);

  const isValid =
    validLength &&
    hasNumber &&
    hasUppercase &&
    specialChar &&
    match &&
    validationStarted;

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

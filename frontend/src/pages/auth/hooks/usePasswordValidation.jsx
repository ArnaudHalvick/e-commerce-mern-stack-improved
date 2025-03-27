import { useState, useEffect } from "react";
import { validatePassword } from "../../../utils/validation";

/**
 * Custom hook for validating passwords and providing visual feedback on complex requirements
 *
 * @param {string} password - The password to validate
 * @returns {Object} Validation state information
 */
const usePasswordValidation = (password) => {
  const [validationState, setValidationState] = useState({
    isValid: false,
    requirements: {
      length: false,
      uppercase: false,
      lowercase: true, // Always true since we don't have a specific requirement
      number: false,
      special: false,
    },
    score: 0,
  });

  useEffect(() => {
    if (!password) {
      setValidationState({
        isValid: false,
        requirements: {
          length: false,
          uppercase: false,
          lowercase: true, // Always true
          number: false,
          special: false,
        },
        score: 0,
      });
      return;
    }

    // Use the validatePassword function from our utils
    const validation = validatePassword(password);

    setValidationState({
      isValid: validation.isValid,
      requirements: {
        length: validation.details.length,
        uppercase: validation.details.uppercase,
        lowercase: true, // Always true
        number: validation.details.number,
        special: validation.details.special,
      },
      // Calculate password strength score (0-4)
      score: Object.values(validation.details).filter(Boolean).length,
    });
  }, [password]);

  return validationState;
};

export default usePasswordValidation;

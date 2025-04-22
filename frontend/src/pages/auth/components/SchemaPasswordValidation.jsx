import React from "react";
import PropTypes from "prop-types";
import { passwordSchema } from "../../../utils/validationSchemas";

/**
 * Password validation feedback component based on validation schema
 *
 * This component displays real-time validation feedback for password fields based on the
 * validation rules from validationSchemas.js. It adapts dynamically if the rules change.
 *
 * @param {Object} props Component props
 * @param {boolean} props.validLength Whether password meets length requirements
 * @param {boolean} props.hasUppercase Whether password contains uppercase letter
 * @param {boolean} props.hasNumber Whether password contains number
 * @param {boolean} props.specialChar Whether password contains special character
 * @param {boolean} props.match Whether passwords match
 * @param {boolean} props.showFeedback Whether to show validation feedback
 * @param {string} props.confirmPassword Confirmation password value
 * @param {Object} props.customValidationSchema Optional custom validation schema to override the default
 * @param {boolean} props.isLoading Whether the validation schema is still loading
 */
const SchemaPasswordValidation = ({
  validLength,
  hasUppercase,
  hasNumber,
  specialChar,
  match,
  showFeedback,
  confirmPassword,
  customValidationSchema,
  isLoading,
}) => {
  // Don't render anything if we shouldn't show feedback yet
  if (!showFeedback) return null;

  // Use the custom schema if provided, otherwise use the default password schema
  const schema = customValidationSchema || passwordSchema;

  // If schema has no validators (like loginPasswordSchema), don't show any validation UI
  if (!schema.validators || schema.validators.length === 0) {
    return null;
  }

  // Build requirements based on the schema
  const requirements = [
    {
      id: "length",
      text: `At least ${schema.minLength} characters long`,
      isValid: validLength,
      isLoading,
    },
  ];

  // Add validator requirements from the schema
  if (schema.validators) {
    schema.validators.forEach((validator, index) => {
      let validation = false;

      // Match validation status with the right prop based on index/pattern
      if (index === 0) validation = hasUppercase;
      else if (index === 1) validation = hasNumber;
      else if (index === 2) validation = specialChar;

      requirements.push({
        id: `validator-${index}`,
        text: validator.message,
        isValid: validation,
        isLoading,
      });
    });
  }

  return (
    <div
      className="password-validation-feedback"
      id="password-validation"
      aria-live="polite"
    >
      <p className="password-validation-feedback__title">
        Password Requirements:
      </p>
      <ul className="password-validation-feedback__list">
        {requirements.map((requirement) => (
          <li
            key={requirement.id}
            className={`password-validation-feedback__item ${
              requirement.isLoading
                ? "password-validation-feedback__item--loading"
                : requirement.isValid
                ? "password-validation-feedback__item--valid"
                : "password-validation-feedback__item--invalid"
            }`}
          >
            <span className="password-validation-feedback__icon">
              {requirement.isLoading ? "⟳" : requirement.isValid ? "✓" : "✕"}
            </span>
            <span>{requirement.text}</span>
          </li>
        ))}

        {confirmPassword && (
          <li
            className={`password-validation-feedback__item ${
              match
                ? "password-validation-feedback__item--valid"
                : "password-validation-feedback__item--invalid"
            }`}
          >
            <span className="password-validation-feedback__icon">
              {match ? "✓" : "✕"}
            </span>
            <span>Passwords match</span>
          </li>
        )}
      </ul>
    </div>
  );
};

SchemaPasswordValidation.propTypes = {
  validLength: PropTypes.bool,
  hasUppercase: PropTypes.bool,
  hasNumber: PropTypes.bool,
  specialChar: PropTypes.bool,
  match: PropTypes.bool,
  showFeedback: PropTypes.bool.isRequired,
  confirmPassword: PropTypes.string,
  customValidationSchema: PropTypes.object,
  isLoading: PropTypes.bool,
};

SchemaPasswordValidation.defaultProps = {
  validLength: false,
  hasUppercase: false,
  hasNumber: false,
  specialChar: false,
  match: false,
  confirmPassword: "",
  customValidationSchema: null,
  isLoading: false,
};

export default SchemaPasswordValidation;

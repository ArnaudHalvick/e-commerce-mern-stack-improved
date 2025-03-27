import React from "react";
import PropTypes from "prop-types";

/**
 * Password validation feedback component
 *
 * Displays real-time validation feedback for password fields based on
 * predefined validation rules
 *
 * @param {Object} props Component props
 * @param {boolean} props.validLength Whether password meets length requirements
 * @param {boolean} props.hasUppercase Whether password contains uppercase letter
 * @param {boolean} props.hasNumber Whether password contains number
 * @param {boolean} props.specialChar Whether password contains special character
 * @param {boolean} props.match Whether passwords match
 * @param {boolean} props.showFeedback Whether to show validation feedback
 * @param {string} props.confirmPassword Confirmation password value
 */
const PasswordValidation = ({
  validLength,
  hasUppercase,
  hasNumber,
  specialChar,
  match,
  showFeedback,
  confirmPassword,
}) => {
  // Don't render anything if we shouldn't show feedback yet
  if (!showFeedback) return null;

  const requirements = [
    {
      id: "length",
      text: "At least 8 characters long",
      isValid: validLength,
    },
    {
      id: "uppercase",
      text: "At least 1 uppercase letter",
      isValid: hasUppercase,
    },
    {
      id: "number",
      text: "At least 1 number",
      isValid: hasNumber,
    },
    {
      id: "special",
      text: "At least 1 special character",
      isValid: specialChar,
    },
  ];

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
              requirement.isValid
                ? "password-validation-feedback__item--valid"
                : "password-validation-feedback__item--invalid"
            }`}
          >
            <span className="password-validation-feedback__icon">
              {requirement.isValid ? "✓" : "✕"}
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

PasswordValidation.propTypes = {
  validLength: PropTypes.bool,
  hasUppercase: PropTypes.bool,
  hasNumber: PropTypes.bool,
  specialChar: PropTypes.bool,
  match: PropTypes.bool,
  showFeedback: PropTypes.bool.isRequired,
  confirmPassword: PropTypes.string,
};

PasswordValidation.defaultProps = {
  validLength: false,
  hasUppercase: false,
  hasNumber: false,
  specialChar: false,
  match: false,
  confirmPassword: "",
};

export default PasswordValidation;

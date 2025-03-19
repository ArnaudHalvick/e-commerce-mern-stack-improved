import React from "react";

/**
 * Component to display password validation feedback
 *
 * @param {Object} props - Component props
 * @param {boolean} props.validLength - If password meets length requirements
 * @param {boolean} props.hasNumber - If password contains a number
 * @param {boolean} props.specialChar - If password contains a special character
 * @param {boolean} props.match - If passwords match
 * @param {boolean} props.showFeedback - If validation feedback should be displayed
 */
const PasswordValidation = ({
  validLength,
  hasNumber,
  specialChar,
  match,
  showFeedback,
  confirmPassword,
}) => {
  // Don't render anything if we shouldn't show feedback yet
  if (!showFeedback) return null;

  return (
    <div className="password-validation-feedback">
      <h4 className="password-validation-feedback__title">
        Password requirements:
      </h4>
      <ul className="password-validation-feedback__list">
        <li
          className={`password-validation-feedback__item ${
            validLength
              ? "password-validation-feedback__item--valid"
              : "password-validation-feedback__item--invalid"
          }`}
        >
          <span className="password-validation-feedback__icon">
            {validLength ? "✓" : "✕"}
          </span>
          <span>At least 8 characters long</span>
        </li>
        <li
          className={`password-validation-feedback__item ${
            hasNumber
              ? "password-validation-feedback__item--valid"
              : "password-validation-feedback__item--invalid"
          }`}
        >
          <span className="password-validation-feedback__icon">
            {hasNumber ? "✓" : "✕"}
          </span>
          <span>Contains at least 1 number</span>
        </li>
        <li
          className={`password-validation-feedback__item ${
            specialChar
              ? "password-validation-feedback__item--valid"
              : "password-validation-feedback__item--invalid"
          }`}
        >
          <span className="password-validation-feedback__icon">
            {specialChar ? "✓" : "✕"}
          </span>
          <span>Contains at least 1 special character</span>
        </li>
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

export default PasswordValidation;

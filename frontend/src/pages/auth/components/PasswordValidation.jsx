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
      <h4>Password requirements:</h4>
      <ul>
        <li className={validLength ? "valid" : "invalid"}>
          <span className="validation-icon">{validLength ? "✓" : "✕"}</span>
          <span>At least 8 characters long</span>
        </li>
        <li className={hasNumber ? "valid" : "invalid"}>
          <span className="validation-icon">{hasNumber ? "✓" : "✕"}</span>
          <span>Contains at least 1 number</span>
        </li>
        <li className={specialChar ? "valid" : "invalid"}>
          <span className="validation-icon">{specialChar ? "✓" : "✕"}</span>
          <span>Contains at least 1 special character</span>
        </li>
        {confirmPassword && (
          <li className={match ? "valid" : "invalid"}>
            <span className="validation-icon">{match ? "✓" : "✕"}</span>
            <span>Passwords match</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default PasswordValidation;

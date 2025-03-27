import React from "react";
import PropTypes from "prop-types";

/**
 * Password validation feedback component based on backend validation schema
 *
 * This component displays real-time validation feedback for password fields based on the
 * validation rules fetched from the backend. It adapts dynamically if the rules change
 * on the backend.
 *
 * @param {Object} props Component props
 * @param {boolean} props.validLength Whether password meets length requirements
 * @param {boolean} props.hasUppercase Whether password contains uppercase letter
 * @param {boolean} props.hasNumber Whether password contains number
 * @param {boolean} props.specialChar Whether password contains special character
 * @param {boolean} props.match Whether passwords match
 * @param {boolean} props.showFeedback Whether to show validation feedback
 * @param {string} props.confirmPassword Confirmation password value
 * @param {Object} props.validationSchema Validation schema from backend
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
  validationSchema,
  isLoading,
}) => {
  // Don't render anything if we shouldn't show feedback yet or no schema
  if (!showFeedback) return null;

  // Show loading indicator if schema is still loading
  if (isLoading) {
    return (
      <div className="password-validation-feedback" aria-live="polite">
        <p>Loading password requirements...</p>
      </div>
    );
  }

  // Don't show anything if we don't have a schema
  if (!validationSchema?.password) {
    return null;
  }

  // Extract validation requirements from schema
  const getRequirements = () => {
    const schema = validationSchema.password;
    const requirements = [];

    // Add minimum length requirement if specified - schema is now normalized
    if (schema.minLength) {
      const minLength = schema.minLength;

      requirements.push({
        id: "length",
        text: `At least ${minLength} characters long`,
        isValid: validLength,
      });
    }

    // Check if we need to look for explicit requiresX flags or extract from message
    const needsToInferFromMessage =
      !schema.requiresUppercase &&
      !schema.requiresNumber &&
      !schema.requiresSpecial;

    // Check explicit requirement flags (from our updated extractor)
    if (
      schema.requiresUppercase ||
      (needsToInferFromMessage &&
        schema.message?.toLowerCase().includes("uppercase"))
    ) {
      requirements.push({
        id: "uppercase",
        text: "At least 1 uppercase letter",
        isValid: hasUppercase,
      });
    }

    if (
      schema.requiresNumber ||
      (needsToInferFromMessage &&
        schema.message?.toLowerCase().includes("number"))
    ) {
      requirements.push({
        id: "number",
        text: "At least 1 number",
        isValid: hasNumber,
      });
    }

    if (
      schema.requiresSpecial ||
      (needsToInferFromMessage &&
        schema.message?.toLowerCase().includes("special"))
    ) {
      requirements.push({
        id: "special",
        text: "At least 1 special character",
        isValid: specialChar,
      });
    }

    // If we still have no requirements but have a pattern, add the standard set
    if (requirements.length <= 1 && schema.pattern) {
      if (!requirements.some((r) => r.id === "uppercase")) {
        requirements.push({
          id: "uppercase",
          text: "At least 1 uppercase letter",
          isValid: hasUppercase,
        });
      }

      if (!requirements.some((r) => r.id === "number")) {
        requirements.push({
          id: "number",
          text: "At least 1 number",
          isValid: hasNumber,
        });
      }

      if (!requirements.some((r) => r.id === "special")) {
        requirements.push({
          id: "special",
          text: "At least 1 special character",
          isValid: specialChar,
        });
      }
    }

    return requirements;
  };

  const requirements = getRequirements();

  // Don't show an empty list
  if (requirements.length === 0) {
    return null;
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
  validationSchema: PropTypes.object,
  isLoading: PropTypes.bool,
};

SchemaPasswordValidation.defaultProps = {
  validLength: false,
  hasUppercase: false,
  hasNumber: false,
  specialChar: false,
  match: false,
  confirmPassword: "",
  validationSchema: null,
  isLoading: false,
};

export default SchemaPasswordValidation;

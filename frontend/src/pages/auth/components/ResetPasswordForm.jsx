import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import SchemaPasswordValidation from "./SchemaPasswordValidation";

/**
 * Reset Password form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Object} props.errors - Error messages
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.passwordValidation - Password validation state
 * @param {Object} props.validationSchema - Validation schema from backend
 * @param {boolean} props.isLoading - Schema validation loading state
 */
const ResetPasswordForm = ({
  formData,
  handleChange,
  handleSubmit,
  errors,
  loading,
  passwordValidation,
  validationSchema,
  isLoading,
}) => {
  const {
    validLength,
    hasUppercase,
    hasNumber,
    specialChar,
    match,
    validationStarted,
  } = passwordValidation || {};

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password.length > 0;

  // Basic fallback text to show if validation requirements fail to load
  const renderFallbackRequirements = () => {
    if (isLoading) return <p>Loading password requirements...</p>;

    return (
      <div className="password-requirements-fallback">
        <p>Password must:</p>
        <ul>
          <li>Be at least 8 characters long</li>
          <li>Include at least 1 uppercase letter</li>
          <li>Include at least 1 number</li>
          <li>Include at least 1 special character (!@#$%^&*, etc)</li>
        </ul>
      </div>
    );
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__description">
        <p>
          Create a new password for your account. Your new password must meet
          the requirements below.
        </p>
      </div>

      <div className="auth-form__fields">
        <FormInputField
          type="password"
          name="password"
          label="New Password"
          value={formData.password || ""}
          onChange={handleChange}
          error={errors?.password}
          placeholder="Enter your new password"
          className={`auth-form__input ${
            validationStarted ? "auth-form__input--validation-active" : ""
          }`}
          required
          aria-describedby="password-validation"
          autocomplete="new-password"
        />

        <FormInputField
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword || ""}
          onChange={handleChange}
          error={errors?.confirmPassword}
          placeholder="Confirm your new password"
          className={`auth-form__input ${
            formData.confirmPassword
              ? match
                ? "auth-form__input--match"
                : "auth-form__input--no-match"
              : ""
          }`}
          required
          aria-describedby="password-match-validation"
          autocomplete="new-password"
        />

        {/* Use the SchemaPasswordValidation if validationSchema is available or fallback to basic requirements */}
        {validationSchema ? (
          <SchemaPasswordValidation
            validLength={validLength}
            hasUppercase={hasUppercase}
            hasNumber={hasNumber}
            specialChar={specialChar}
            match={match}
            showFeedback={showValidation}
            confirmPassword={formData.confirmPassword}
            validationSchema={validationSchema}
            isLoading={isLoading}
          />
        ) : showValidation ? (
          renderFallbackRequirements()
        ) : null}
      </div>

      {errors?.general && (
        <div className="auth-form__error" role="alert">
          {errors.general}
        </div>
      )}

      <div className="auth-form__actions">
        <FormSubmitButton
          isLoading={loading}
          disabled={loading}
          text="Reset Password"
          loadingText="Resetting..."
          className="auth-form__submit-btn"
        />

        <div className="auth-form__links">
          <Link to="/login" className="auth-form__link">
            Back to login
          </Link>
        </div>
      </div>
    </form>
  );
};

ResetPasswordForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  passwordValidation: PropTypes.object,
  validationSchema: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default ResetPasswordForm;

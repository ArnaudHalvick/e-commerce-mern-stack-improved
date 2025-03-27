import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PasswordValidation from "./PasswordValidation";

/**
 * Reset Password form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Function} props.handleBlur - Function to handle blur events
 * @param {Object} props.errors - Error messages
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.passwordValidation - Password validation state
 */
const ResetPasswordForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleBlur,
  errors,
  loading,
  passwordValidation,
}) => {
  // Extract password validation fields
  const {
    requirements: {
      length: validLength = false,
      uppercase: hasUppercase = false,
      number: hasNumber = false,
      special: specialChar = false,
    } = {},
  } = passwordValidation || {};

  // Calculate if passwords match
  const match =
    formData.password === formData.confirmPassword && formData.password !== "";

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password.length > 0;

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
          onBlur={handleBlur}
          error={errors?.password}
          placeholder="Enter your new password"
          className={`auth-form__input ${
            showValidation ? "auth-form__input--validation-active" : ""
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
          onBlur={handleBlur}
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

        <PasswordValidation
          validLength={validLength}
          hasUppercase={hasUppercase}
          hasNumber={hasNumber}
          specialChar={specialChar}
          match={match}
          showFeedback={showValidation}
          confirmPassword={formData.confirmPassword}
        />
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
  handleBlur: PropTypes.func,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  passwordValidation: PropTypes.object,
};

export default ResetPasswordForm;

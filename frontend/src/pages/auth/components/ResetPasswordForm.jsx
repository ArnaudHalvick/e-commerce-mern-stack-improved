import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormInput, FormSubmitButton } from "../../../components/ui";
import SchemaPasswordValidation from "./SchemaPasswordValidation";
import { passwordSchema } from "../../../utils/validationSchemas";

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
 */
const ResetPasswordForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleBlur,
  errors,
  loading,
}) => {
  // Password validation states based on schema requirements
  const passwordValidation = {
    validLength: formData.password?.length >= passwordSchema.minLength,
    hasUppercase:
      formData.password &&
      passwordSchema.validators[0].pattern.test(formData.password),
    hasNumber:
      formData.password &&
      passwordSchema.validators[1].pattern.test(formData.password),
    specialChar:
      formData.password &&
      passwordSchema.validators[2].pattern.test(formData.password),
  };

  // Calculate if passwords match
  const match =
    formData.password === formData.confirmPassword && formData.password !== "";

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password?.length > 0;

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__description">
        <p>
          Create a new password for your account. Your new password must meet
          the requirements below.
        </p>
      </div>

      <div className="auth-form__fields">
        <FormInput
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

        <FormInput
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
          aria-describedby="password-validation"
          autocomplete="new-password"
        />

        <SchemaPasswordValidation
          validLength={passwordValidation.validLength}
          hasUppercase={passwordValidation.hasUppercase}
          hasNumber={passwordValidation.hasNumber}
          specialChar={passwordValidation.specialChar}
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
          text="Reset Password"
          loadingText="Resetting Password..."
          isLoading={loading}
          className="auth-form__submit"
        />
        <Link to="/login" className="auth-form__secondary-link">
          Back to Login
        </Link>
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
};

ResetPasswordForm.defaultProps = {
  handleBlur: () => {},
  errors: {},
  loading: false,
};

export default ResetPasswordForm;

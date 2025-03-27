import React, { useState } from "react";
import PropTypes from "prop-types";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PasswordValidation from "./PasswordValidation";

/**
 * Signup form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.errors - Field-level error messages
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Function} props.handleBlur - Function to handle input blur events
 */
const SignupForm = ({
  formData,
  handleChange,
  loading,
  errors,
  handleSubmit,
  handleBlur,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Password validation states
  const passwordValidation = {
    validLength: formData.password?.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password || ""),
    hasNumber: /[0-9]/.test(formData.password || ""),
    specialChar: /[^A-Za-z0-9]/.test(formData.password || ""),
    match:
      formData.password === formData.confirmPassword &&
      formData.password !== "",
    validationStarted: formData.password?.length > 0,
  };

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password?.length > 0;

  const handleFormSubmit = (e) => {
    if (!termsAccepted) {
      e.preventDefault();
      if (errors && typeof errors === "object") {
        errors.terms =
          "You must accept the terms and conditions to create an account";
      }
      return;
    }

    handleSubmit(e);
  };

  return (
    <form className="auth-form" onSubmit={handleFormSubmit} noValidate>
      <div className="auth-form__fields">
        <FormInputField
          type="text"
          name="username"
          label="Your name"
          value={formData.username || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors?.username}
          placeholder="John Doe"
          required={true}
          className="auth-form__input"
          title="Please enter your name"
        />

        <FormInputField
          type="email"
          name="email"
          label="Email address"
          value={formData.email || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors?.email}
          placeholder="your@email.com"
          required={true}
          className="auth-form__input"
          title="Please enter a valid email address"
        />

        <FormInputField
          type="password"
          name="password"
          label="Password"
          value={formData.password || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors?.password}
          placeholder="Create a strong password"
          className={`auth-form__input ${
            passwordValidation.validationStarted
              ? "auth-form__input--validation-active"
              : ""
          }`}
          required={true}
          aria-describedby="password-validation"
          autocomplete="new-password"
          title="Please create a strong password"
        />

        <FormInputField
          type="password"
          name="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors?.confirmPassword}
          placeholder="Confirm your password"
          className={`auth-form__input ${
            formData.confirmPassword
              ? passwordValidation.match
                ? "auth-form__input--match"
                : "auth-form__input--no-match"
              : ""
          }`}
          required={true}
          aria-describedby="password-match-validation"
          autocomplete="new-password"
          title="Please confirm your password"
        />

        <PasswordValidation
          validLength={passwordValidation.validLength}
          hasUppercase={passwordValidation.hasUppercase}
          hasNumber={passwordValidation.hasNumber}
          specialChar={passwordValidation.specialChar}
          match={passwordValidation.match}
          showFeedback={showValidation}
          confirmPassword={formData.confirmPassword}
        />
      </div>

      <div className="auth-form__terms">
        <input
          className="auth-form__checkbox"
          type="checkbox"
          name="terms"
          id="terms"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
        />
        <p className="auth-form__terms-text">
          By creating an account, I agree to the Terms of Service and Privacy
          Policy
        </p>
      </div>

      {errors?.terms && (
        <p className="auth-form__error" role="alert">
          {errors.terms}
        </p>
      )}

      <div className="auth-form__actions">
        <FormSubmitButton
          isLoading={loading}
          text="Create Account"
          loadingText="Creating account..."
          disabled={!termsAccepted}
          className="auth-form__submit-btn"
          size="medium"
          variant="primary"
        />
      </div>
    </form>
  );
};

SignupForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

SignupForm.defaultProps = {
  loading: false,
  errors: {},
};

export default SignupForm;

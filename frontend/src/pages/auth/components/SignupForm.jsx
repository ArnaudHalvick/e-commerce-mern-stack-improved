import React from "react";
import PropTypes from "prop-types";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PasswordValidation from "./PasswordValidation";

/**
 * Signup form component with enhanced error handling
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.errors - Field-level error messages
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Boolean} props.termsAccepted - Terms and conditions acceptance state
 * @param {Function} props.setTermsAccepted - Function to update terms acceptance state
 * @param {Object} props.passwordValidation - Password validation state
 * @param {Boolean} props.isOffline - Whether the user is offline
 */
const SignupForm = ({
  formData,
  changeHandler,
  loading,
  errors,
  handleSubmit,
  termsAccepted,
  setTermsAccepted,
  passwordValidation,
  isOffline,
}) => {
  const {
    validLength,
    hasNumber,
    hasUppercase,
    specialChar,
    match,
    validationStarted,
  } = passwordValidation || {};

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password.length > 0;

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__fields">
        <FormInputField
          type="text"
          name="username"
          label="Your name"
          value={formData.username || ""}
          onChange={changeHandler}
          error={errors?.username}
          placeholder="John Doe"
          required
          className="auth-form__input"
        />

        <FormInputField
          type="email"
          name="email"
          label="Email address"
          value={formData.email || ""}
          onChange={changeHandler}
          error={errors?.email}
          placeholder="your@email.com"
          validation={{
            pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
            title: "Enter a valid email address",
          }}
          required
          className="auth-form__input"
        />

        <FormInputField
          type="password"
          name="password"
          label="Password"
          value={formData.password || ""}
          onChange={changeHandler}
          error={errors?.password}
          placeholder="Create a strong password"
          className={`auth-form__input ${
            validationStarted ? "auth-form__input--validation-active" : ""
          }`}
          required
          aria-describedby="password-validation"
        />

        <FormInputField
          type="password"
          name="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword || ""}
          onChange={changeHandler}
          error={errors?.confirmPassword}
          placeholder="Confirm your password"
          className={`auth-form__input ${
            formData.confirmPassword
              ? match
                ? "auth-form__input--match"
                : "auth-form__input--no-match"
              : ""
          }`}
          required
          aria-describedby="password-match-validation"
        />

        <PasswordValidation
          validLength={validLength}
          hasNumber={hasNumber}
          hasUppercase={hasUppercase}
          specialChar={specialChar}
          match={match}
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
          disabled={isOffline || (!termsAccepted && !errors?.terms)}
          className="auth-form__submit-btn"
          size="medium"
          variant="primary"
          style={{
            height: "3.5rem",
            fontSize: "1.25rem",
            borderRadius: "0.5rem",
          }}
        />
      </div>
    </form>
  );
};

SignupForm.propTypes = {
  formData: PropTypes.object.isRequired,
  changeHandler: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  termsAccepted: PropTypes.bool.isRequired,
  setTermsAccepted: PropTypes.func.isRequired,
  passwordValidation: PropTypes.object,
  isOffline: PropTypes.bool,
};

SignupForm.defaultProps = {
  loading: false,
  errors: {},
  isOffline: false,
  passwordValidation: {},
};

export default SignupForm;

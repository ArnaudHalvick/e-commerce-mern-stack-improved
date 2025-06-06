import React, { useState } from "react";
import PropTypes from "prop-types";
import { FormInput, FormSubmitButton } from "../../../components/ui";
import SchemaPasswordValidation from "./SchemaPasswordValidation";
import { passwordSchema } from "../../../utils/validationSchemas";

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
    match:
      formData.password === formData.confirmPassword &&
      formData.password !== "",
    validationStarted: formData.password?.length > 0,
  };

  // Check if the password meets all requirements
  const isPasswordValid =
    passwordValidation.validLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasNumber &&
    passwordValidation.specialChar &&
    passwordValidation.match;

  // Check if all required fields are filled and valid
  const isFormValid = () => {
    // Required fields
    const requiredFields = [
      { field: "username", value: formData.username },
      { field: "email", value: formData.email },
      { field: "password", value: formData.password },
      { field: "confirmPassword", value: formData.confirmPassword },
    ];

    // Check if any required fields are empty
    const hasEmptyFields = requiredFields.some(
      (item) => !item.value || item.value.trim() === ""
    );

    // Check if there are any validation errors
    const hasErrors = errors && Object.keys(errors).some((key) => errors[key]);

    // Form is valid if all required fields are filled, password is valid, and there are no errors
    return !hasEmptyFields && isPasswordValid && !hasErrors;
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

  // Determine if the submit button should be disabled
  const isSubmitDisabled = !termsAccepted || !isFormValid();

  return (
    <form
      className="auth-form"
      onSubmit={handleFormSubmit}
      noValidate
      autoComplete="on"
      name="signup"
    >
      <div className="auth-form__fields">
        <FormInput
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
          autoComplete="name"
          disabled={loading}
        />

        <FormInput
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
          autoComplete="email"
          disabled={loading}
        />

        <FormInput
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
          autoComplete="new-password"
          title="Please create a strong password"
          disabled={loading}
        />

        <FormInput
          type="password"
          name="confirmPassword"
          label="Confirm Password"
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
          aria-describedby="password-validation"
          autoComplete="new-password"
          title="Please confirm your password"
          disabled={loading}
        />

        <SchemaPasswordValidation
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
          disabled={isSubmitDisabled}
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
  handleBlur: PropTypes.func,
};

SignupForm.defaultProps = {
  loading: false,
  errors: {},
  handleBlur: () => {},
};

export default SignupForm;

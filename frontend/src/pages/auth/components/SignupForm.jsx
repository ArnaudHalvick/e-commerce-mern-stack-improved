import React from "react";
import PasswordValidation from "./PasswordValidation";

/**
 * Signup form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.error - Error message
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Boolean} props.termsAccepted - Terms and conditions acceptance state
 * @param {Function} props.setTermsAccepted - Function to update terms acceptance state
 * @param {Object} props.passwordValidation - Password validation state
 */
const SignupForm = ({
  formData,
  changeHandler,
  loading,
  error,
  handleSubmit,
  termsAccepted,
  setTermsAccepted,
  passwordValidation,
}) => {
  const { validLength, hasNumber, specialChar, match, validationStarted } =
    passwordValidation || {};

  // Only show validation feedback when user has started typing a password
  const showValidation = formData.password.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="signup-fields">
        <input
          type="text"
          placeholder="Your name"
          name="username"
          value={formData.username}
          onChange={changeHandler}
          required
          autoComplete="name"
        />
        <input
          type="email"
          placeholder="Email address"
          name="email"
          value={formData.email}
          onChange={changeHandler}
          required
          autoComplete="email"
        />

        <div className="password-fields">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
            required
            autoComplete="new-password"
            className={validationStarted ? "validation-active" : ""}
            aria-describedby="password-validation"
          />

          <input
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={changeHandler}
            required
            autoComplete="new-password"
            className={
              formData.confirmPassword ? (match ? "match" : "no-match") : ""
            }
            aria-describedby="password-match-validation"
          />

          <PasswordValidation
            validLength={validLength}
            hasNumber={hasNumber}
            specialChar={specialChar}
            match={match}
            showFeedback={showValidation}
            confirmPassword={formData.confirmPassword}
          />
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Create Account"}
      </button>

      <div className="signup-agree">
        <input
          type="checkbox"
          name="terms"
          id="terms"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
        />
        <p>
          By creating an account, I agree to the Terms of Service and Privacy
          Policy
        </p>
      </div>
    </form>
  );
};

export default SignupForm;

import React from "react";

/**
 * Signup form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.error - Error message
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Boolean} props.termsAccepted - Terms and conditions acceptance state
 * @param {Function} props.setTermsAccepted - Function to update terms acceptance state
 */
const SignupForm = ({
  formData,
  changeHandler,
  loading,
  error,
  handleSubmit,
  termsAccepted,
  setTermsAccepted,
}) => (
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
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={changeHandler}
        required
        autoComplete="new-password"
      />
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

export default SignupForm;

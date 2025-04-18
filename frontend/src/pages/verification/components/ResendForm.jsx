import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * ResendForm component for requesting a new verification email
 *
 * @param {object} props Component props
 * @param {function} props.onResend Function to call when resend is requested
 * @param {string} props.initialEmail Initial email value (optional)
 * @param {boolean} props.success Whether the resend was successful
 * @param {string} props.error Error message if resend failed
 * @param {boolean} props.loading Whether the resend is loading
 */
const ResendForm = ({
  onResend,
  initialEmail = "",
  success,
  error,
  loading,
}) => {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e) => {
    e.preventDefault();
    onResend(email);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  // Early return for success state
  if (success) {
    return (
      <div className="resend-success" aria-live="polite">
        <p>Verification email sent! Please check your inbox.</p>
        <Link
          to="/login"
          className="btn-secondary mt-3"
          tabIndex="0"
          aria-label="Return to Login"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="verification-form"
      aria-label="Email verification resend form"
    >
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your email"
          aria-required="true"
          aria-describedby={error ? "email-error" : undefined}
          disabled={loading}
          required
        />
        {error && (
          <p id="email-error" className="error-text">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="btn-primary"
        aria-label={
          loading
            ? "Sending verification email"
            : "Request new verification email"
        }
      >
        {loading ? "Sending..." : "Request New Verification Email"}
      </button>
    </form>
  );
};

ResendForm.propTypes = {
  onResend: PropTypes.func.isRequired,
  initialEmail: PropTypes.string,
  success: PropTypes.bool,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

ResendForm.defaultProps = {
  initialEmail: "",
  success: false,
  loading: false,
  error: null,
};

export default ResendForm;

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormInput, FormSubmitButton } from "../../../components/ui";

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

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  // Early return for success state
  if (success) {
    return (
      <div className="verification-resend-success" aria-live="polite">
        <p>Verification email sent! Please check your inbox.</p>
        <Link to="/login">
          <FormSubmitButton
            text="Return to Login"
            variant="secondary"
            type="button"
            className="verification-mt-3"
          />
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
      <FormInput
        type="email"
        name="email"
        value={email}
        onChange={handleChange}
        label="Email Address"
        placeholder="Enter your email"
        error={error}
        required={true}
        disabled={loading}
      />

      <FormSubmitButton
        type="submit"
        disabled={loading || !email}
        text="Request New Verification Email"
        loadingText="Sending..."
        isLoading={loading}
        variant="primary"
        aria-label={
          loading
            ? "Sending verification email"
            : "Request new verification email"
        }
      />
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

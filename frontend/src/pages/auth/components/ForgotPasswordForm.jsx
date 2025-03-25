import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormInputField, FormSubmitButton } from "../../../components/form";

/**
 * Forgot Password form component
 *
 * @param {Object} props - Component props
 * @param {string} props.email - Email address value
 * @param {Function} props.setEmail - Function to update email value
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Object} props.errors - Error messages
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.emailSent - Whether the recovery email was sent successfully
 */
const ForgotPasswordForm = ({
  email,
  setEmail,
  handleSubmit,
  errors,
  loading,
  emailSent,
}) => {
  // If email was sent successfully, show success message
  if (emailSent) {
    return (
      <div className="auth-form__success">
        <h2>Recovery Email Sent</h2>
        <p>
          We've sent password recovery instructions to <strong>{email}</strong>.
        </p>
        <p>
          Please check your email and follow the instructions to reset your
          password. If you don't see the email, check your spam folder.
        </p>
        <p>
          <Link to="/login" className="auth-form__link">
            Return to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__description">
        <p>
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
      </div>

      <div className="auth-form__fields">
        <FormInputField
          type="email"
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors?.email}
          placeholder="your@email.com"
          required
          className="auth-form__input"
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
          text="Send Recovery Email"
          loadingText="Sending..."
          className="auth-form__submit"
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

ForgotPasswordForm.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  emailSent: PropTypes.bool,
};

export default ForgotPasswordForm;

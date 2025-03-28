import React from "react";
import { Link } from "react-router-dom";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PropTypes from "prop-types";

/**
 * Login form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.errors - Field-level error messages
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Function} props.handleBlur - Function to handle input blur events
 */
const LoginForm = ({
  formData,
  handleChange,
  loading,
  errors,
  handleSubmit,
  handleBlur,
}) => {
  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__fields">
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
          placeholder="Your password"
          required={true}
          className="auth-form__input"
          autoComplete="current-password"
          title="Please enter your password"
        />

        <div className="auth-form__forgot-password">
          <Link to="/forgot-password" className="auth-form__link">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div className="auth-form__actions">
        <FormSubmitButton
          isLoading={loading}
          text="Login"
          loadingText="Logging in..."
          className="auth-form__submit-btn"
          size="medium"
          variant="primary"
        />
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

LoginForm.defaultProps = {
  loading: false,
  errors: {},
};

export default LoginForm;

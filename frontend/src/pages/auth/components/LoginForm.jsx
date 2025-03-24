import React from "react";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PropTypes from "prop-types";

/**
 * Login form component with enhanced error handling
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.errors - Field-level error messages
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Boolean} props.isOffline - Whether the user is offline
 */
const LoginForm = ({
  formData,
  changeHandler,
  loading,
  errors,
  handleSubmit,
  isOffline,
}) => (
  <form className="auth-form" onSubmit={handleSubmit} noValidate>
    <div className="auth-form__fields">
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
        placeholder="Your password"
        required
        className="auth-form__input"
      />
    </div>

    <div className="auth-form__actions">
      <FormSubmitButton
        isLoading={loading}
        text="Login"
        loadingText="Logging in..."
        disabled={isOffline}
        className="auth-form__submit-btn"
      />
    </div>
  </form>
);

LoginForm.propTypes = {
  formData: PropTypes.object.isRequired,
  changeHandler: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  isOffline: PropTypes.bool,
};

LoginForm.defaultProps = {
  loading: false,
  errors: {},
  isOffline: false,
};

export default LoginForm;

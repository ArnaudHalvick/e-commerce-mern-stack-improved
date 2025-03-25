import React from "react";
import { Link } from "react-router-dom";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import PropTypes from "prop-types";

/**
 * Login form component with schema-based validation
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {Object} props.errors - Field-level error messages
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {Boolean} props.isOffline - Whether the user is offline
 * @param {Object} props.validationSchema - Validation schema from backend
 * @param {Boolean} props.isLoading - Whether the validation schema is still loading
 */
const LoginForm = ({
  formData,
  changeHandler,
  loading,
  errors,
  handleSubmit,
  isOffline,
  validationSchema,
  isLoading,
}) => {
  // Get validation attributes for inputs based on schema
  const getValidationAttributes = (fieldName) => {
    if (!validationSchema || isLoading) return {};

    const fieldSchema = validationSchema[fieldName];
    if (!fieldSchema) return {};

    const attributes = {
      required: fieldSchema.required || false,
    };

    // Add title with validation message
    if (fieldSchema.message) {
      attributes.title = fieldSchema.message;
    }

    return attributes;
  };

  return (
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
          required={validationSchema?.email?.required}
          className="auth-form__input"
          {...getValidationAttributes("email")}
        />

        <FormInputField
          type="password"
          name="password"
          label="Password"
          value={formData.password || ""}
          onChange={changeHandler}
          error={errors?.password}
          placeholder="Your password"
          required={validationSchema?.password?.required}
          className="auth-form__input"
          autocomplete="current-password"
          {...getValidationAttributes("password")}
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
          disabled={isOffline}
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

LoginForm.propTypes = {
  formData: PropTypes.object.isRequired,
  changeHandler: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errors: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  isOffline: PropTypes.bool,
  validationSchema: PropTypes.object,
  isLoading: PropTypes.bool,
};

LoginForm.defaultProps = {
  loading: false,
  errors: {},
  isOffline: false,
  validationSchema: null,
  isLoading: false,
};

export default LoginForm;

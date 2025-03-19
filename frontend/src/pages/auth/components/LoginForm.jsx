import React from "react";

/**
 * Login form component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data values
 * @param {Function} props.changeHandler - Function to handle input changes
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.error - Error message
 * @param {Function} props.handleSubmit - Form submission handler
 */
const LoginForm = ({
  formData,
  changeHandler,
  loading,
  error,
  handleSubmit,
}) => (
  <form className="auth-form" onSubmit={handleSubmit}>
    <div className="auth-form__fields">
      <input
        className="auth-form__input"
        type="email"
        placeholder="Email address"
        name="email"
        value={formData.email}
        onChange={changeHandler}
        required
        autoComplete="email"
      />
      <input
        className="auth-form__input"
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={changeHandler}
        required
        autoComplete="current-password"
      />
    </div>
    {error && <p className="auth-form__error">{error}</p>}
    <button className="auth-form__submit-btn" type="submit" disabled={loading}>
      {loading ? "Loading..." : "Login"}
    </button>
  </form>
);

export default LoginForm;

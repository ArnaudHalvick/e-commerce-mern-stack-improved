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
  <form onSubmit={handleSubmit}>
    <div className="signup-fields">
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
        autoComplete="current-password"
      />
    </div>
    {error && <p className="auth-error">{error}</p>}
    <button type="submit" disabled={loading}>
      {loading ? "Loading..." : "Login"}
    </button>
  </form>
);

export default LoginForm;

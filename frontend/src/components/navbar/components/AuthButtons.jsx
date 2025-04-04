import React from "react";
import { Link } from "react-router-dom";

/**
 * AuthButtons Component
 * @param {Object} props - Component props
 * @param {boolean} props.inTransition - Whether the app is in a transition state
 * @returns {JSX.Element} AuthButtons component
 */
const AuthButtons = ({ inTransition }) => (
  <div className="navbar-auth-buttons">
    <Link to="/login" onClick={(e) => inTransition && e.preventDefault()}>
      <button
        className="navbar-button navbar-login-btn"
        disabled={inTransition}
        aria-label="Login to your account"
      >
        Login
      </button>
    </Link>
    <Link to="/signup" onClick={(e) => inTransition && e.preventDefault()}>
      <button
        className="navbar-button navbar-signup-btn"
        disabled={inTransition}
        aria-label="Create a new account"
      >
        Signup
      </button>
    </Link>
  </div>
);

export default AuthButtons;

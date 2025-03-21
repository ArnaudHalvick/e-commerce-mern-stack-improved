import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import useAuthForm from "./hooks/useAuthForm";

// Styles
import "./Auth.css";

/**
 * Auth page component that handles user login and signup
 * @param {Object} props - Component props
 * @param {string} props.initialState - Initial state to show ("Login" or "Signup")
 */
const Auth = ({ initialState = "Login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    state,
    formData,
    termsAccepted,
    loading,
    error,
    passwordValidation,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
  } = useAuthForm();

  // Effect to handle initial state
  useEffect(() => {
    if (initialState === "Signup") {
      setInitialState("Signup");
    }
  }, [initialState, setInitialState]);

  // Effect to update state based on URL path changes
  useEffect(() => {
    const path = location.pathname;
    if (path === "/login") {
      setInitialState("Login");
    } else if (path === "/signup") {
      setInitialState("Signup");
    }
  }, [location.pathname, setInitialState]);

  // Effect to handle email verification needed redirect after login
  useEffect(() => {
    // This will be triggered when email verification is needed after login
    if (error?.emailVerificationNeeded) {
      navigate("/verify-pending");
    }
  }, [error, navigate]);

  return (
    <div className="auth-page">
      <Breadcrumb routes={[{ label: "HOME", path: "/" }, { label: state }]} />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">
            {state === "Signup" ? "Create Account" : "Login"}
          </h1>

          {state === "Login" ? (
            <LoginForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading}
              error={error}
              handleSubmit={handleSubmit}
            />
          ) : (
            <SignupForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading}
              error={error}
              handleSubmit={handleSubmit}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              passwordValidation={passwordValidation}
            />
          )}

          <p className="auth-page__switch">
            {state === "Signup"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Link
              className="auth-page__switch-link"
              to={state === "Signup" ? "/login" : "/signup"}
              onClick={switchState}
            >
              {state === "Signup" ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

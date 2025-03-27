import React, { useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import { useAuthForm } from "./hooks";

// Context
import { AuthContext } from "../../context/AuthContext";

// Styles
import "./Auth.css";
import "../../components/form/FormInputField.css";
import "../../components/form/FormSubmitButton.css";

/**
 * Auth component for handling user login and signup
 */
const Auth = ({ initialState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    loading: authLoading,
    inTransition,
  } = useContext(AuthContext);

  // Initialize with appropriate form type based on initialState
  const formType = initialState === "Signup" ? "register" : "login";
  const {
    formData,
    loading,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleBlur,
    formErrors,
  } = useAuthForm(formType);

  // Redirect authenticated users away from login/signup pages.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const returnTo = location.state?.from || "/";
      navigate(returnTo, {
        replace: true,
        state: { message: "You are already logged in" },
      });
    }
  }, [isAuthenticated, authLoading, navigate, location.state?.from]);

  // Skip showing loading indicator here since we're using AuthLoadingIndicator
  // This prevents the flickering when transitioning between pages
  if (authLoading && !inTransition) {
    return null;
  }

  // Determine current state (Login or Signup) based on path
  const state = location.pathname === "/login" ? "Login" : "Signup";

  return (
    <div className="auth-page">
      <Breadcrumb routes={[{ label: "Home", path: "/" }, { label: state }]} />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">
            {state === "Signup" ? "Create Account" : "Login"}
          </h1>

          {formErrors.general && (
            <div className="auth-page__error" role="alert">
              {formErrors.general}
            </div>
          )}

          {state === "Login" ? (
            <LoginForm
              formData={formData}
              handleChange={handleChange}
              loading={loading || inTransition}
              errors={fieldErrors}
              handleSubmit={handleSubmit}
              handleBlur={handleBlur}
            />
          ) : (
            <SignupForm
              formData={formData}
              handleChange={handleChange}
              loading={loading || inTransition}
              errors={fieldErrors}
              handleSubmit={handleSubmit}
              handleBlur={handleBlur}
            />
          )}

          <p className="auth-page__switch">
            {state === "Signup"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Link
              className="auth-page__switch-link"
              to={state === "Signup" ? "/login" : "/signup"}
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

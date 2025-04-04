import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/state";

// Components
import { LoginForm, SignupForm } from "./components";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import { useAuthForm } from "./hooks";
import useErrorRedux from "../../hooks/useErrorRedux";

// Styles
import "./Auth.css";

/**
 * Auth component for handling user login and signup
 */
const Auth = ({ initialState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useErrorRedux();
  const { isAuthenticated, loading: authLoading, inTransition } = useAuth();

  // Determine form type based on the initialState prop
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

  // Show success message if redirected from password reset
  useEffect(() => {
    if (location.state?.passwordResetSuccess) {
      showSuccess(
        location.state.message ||
          "Password reset successful. Please log in with your new password."
      );

      // Clear the message from location state after showing it
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          passwordResetSuccess: undefined,
          message: undefined,
        },
      });
    }
  }, [location.state, showSuccess, navigate, location.pathname]);

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

  // If authentication is still loading (using AuthLoadingIndicator elsewhere), skip rendering
  if (authLoading && !inTransition) {
    return null;
  }

  // Determine current authentication mode based on URL path
  const authMode = location.pathname === "/login" ? "Login" : "Signup";

  return (
    <div className="auth-page">
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: authMode }]}
      />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">
            {authMode === "Signup" ? "Create Account" : "Login"}
          </h1>

          {/* Display success message from password reset if available */}
          {location.state?.passwordResetSuccess && (
            <div className="auth-page__success" role="alert">
              {location.state.message ||
                "Password reset successful. Please log in with your new password."}
            </div>
          )}

          {formErrors.general && (
            <div className="auth-page__error" role="alert">
              {formErrors.general}
            </div>
          )}

          {authMode === "Login" ? (
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
            {authMode === "Signup"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Link
              className="auth-page__switch-link"
              to={authMode === "Signup" ? "/login" : "/signup"}
            >
              {authMode === "Signup" ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

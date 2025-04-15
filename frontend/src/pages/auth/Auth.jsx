import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/state";

// Components
import { LoginForm, SignupForm, AuthLayout } from "./components";

// Hooks
import { useAuthForm } from "./hooks";
import useErrorRedux from "../../hooks/useErrorRedux";

// Styles
import "./styles/index.css";

/**
 * Auth component for handling user login and signup
 */
const Auth = ({ initialState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useErrorRedux();
  const { isAuthenticated, loading: authLoading, inTransition } = useAuth();

  // Use a ref to track if we've already shown the success message
  const successMessageShown = useRef(false);

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
    // Only process if there's a password reset success message and we haven't shown it yet
    if (location.state?.passwordResetSuccess && !successMessageShown.current) {
      // Mark that we've shown the message to prevent infinite loop
      successMessageShown.current = true;

      showSuccess(
        location.state.message ||
          "Password reset successful. Please log in with your new password."
      );

      // Clear the state in a separate effect to avoid re-triggering this effect
      setTimeout(() => {
        navigate(location.pathname, {
          replace: true,
          state: undefined,
        });
      }, 0);
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
  const title = authMode === "Signup" ? "Create Account" : "Login";

  // Success message from password reset if available, but don't use location.state
  // directly in the component to avoid infinite rerendering
  const successMessage =
    successMessageShown.current && location.state?.passwordResetSuccess
      ? location.state.message ||
        "Password reset successful. Please log in with your new password."
      : "";

  return (
    <AuthLayout
      title={title}
      breadcrumbRoutes={[{ label: "Home", path: "/" }, { label: authMode }]}
      errorMessage={formErrors.general}
      successMessage={successMessage}
    >
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
    </AuthLayout>
  );
};

export default Auth;

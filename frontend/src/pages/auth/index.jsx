import React, { useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import useSchemaAuthForm from "./hooks/useSchemaAuthForm";

// Context
import { AuthContext } from "../../context/AuthContext";

// Styles
import "./Auth.css";
import "../../components/form/FormInputField.css";
import "../../components/form/FormSubmitButton.css";

/**
 * Auth component for handling user login and signup
 * Now using schema-based validation fetched from the backend
 */
const Auth = ({ initialState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    loading: authLoading,
    inTransition,
  } = useContext(AuthContext);

  const {
    state,
    formData,
    termsAccepted,
    loading,
    errors,
    passwordValidation,
    isOffline,
    setTermsAccepted,
    setInitialState,
    changeHandler,
    handleSubmit,
    schema: validationSchema,
    isLoading: schemaLoading,
  } = useSchemaAuthForm();

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

  // Update form state based on the current route, only if it needs to change.
  useEffect(() => {
    const path = location.pathname;
    const desiredState = path === "/login" ? "Login" : "Signup";
    if (state !== desiredState) {
      setInitialState(desiredState);
    }
  }, [location.pathname, state, setInitialState]);

  // Set initial state if provided as prop
  useEffect(() => {
    if (initialState && state !== initialState) {
      setInitialState(initialState);
    }
  }, [initialState, state, setInitialState]);

  // Skip showing loading indicator here since we're using AuthLoadingIndicator
  // This prevents the flickering when transitioning between pages
  if (authLoading && !inTransition) {
    return null;
  }

  return (
    <div className="auth-page">
      <Breadcrumb routes={[{ label: "Home", path: "/" }, { label: state }]} />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">
            {state === "Signup" ? "Create Account" : "Login"}
          </h1>

          {errors.general && (
            <div className="auth-page__error" role="alert">
              {errors.general}
            </div>
          )}

          {state === "Login" ? (
            <LoginForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading || inTransition}
              errors={errors}
              handleSubmit={handleSubmit}
              isOffline={isOffline}
              validationSchema={validationSchema}
              isLoading={schemaLoading}
            />
          ) : (
            <SignupForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading || inTransition}
              isLoading={schemaLoading}
              errors={errors}
              handleSubmit={handleSubmit}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              passwordValidation={passwordValidation}
              isOffline={isOffline}
              validationSchema={validationSchema}
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

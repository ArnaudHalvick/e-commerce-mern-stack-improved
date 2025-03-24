import React, { useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import useAuthForm from "./hooks/useAuthForm";

// Context
import { AuthContext } from "../../context/AuthContext";

// Styles
import "./Auth.css";
import "../../components/form/FormInputField.css";
import "../../components/form/FormSubmitButton.css";

/**
 * Auth page component that handles user login and signup with enhanced error handling
 * @param {Object} props - Component props
 * @param {string} props.initialState - Initial state to show ("Login" or "Signup")
 */
const Auth = ({ initialState = "Login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const initialStateSet = useRef(false);

  const {
    state,
    formData,
    termsAccepted,
    loading,
    errors,
    passwordValidation,
    isOffline,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
  } = useAuthForm();

  // Effect to redirect authenticated users away from login/signup
  useEffect(() => {
    // Only redirect after auth state is determined (not loading)
    if (!authLoading && isAuthenticated) {
      // Redirect to home page or the page they were trying to access
      const returnTo = location.state?.from || "/";
      navigate(returnTo, {
        replace: true,
        state: { message: "You are already logged in" },
      });
    }
  }, [isAuthenticated, authLoading, navigate, location.state?.from]);

  // Combined effect to handle initial state - only runs once
  useEffect(() => {
    if (initialStateSet.current) return;

    const path = location.pathname;

    if (path === "/login") {
      setInitialState("Login");
    } else if (path === "/signup") {
      setInitialState("Signup");
    } else if (initialState === "Signup") {
      setInitialState("Signup");
    }

    initialStateSet.current = true;
  }, [location.pathname, initialState, setInitialState]);

  // If still loading auth state, show loading
  if (authLoading) {
    return <div className="auth-page__loading">Loading...</div>;
  }

  return (
    <div className="auth-page">
      <Breadcrumb routes={[{ label: "HOME", path: "/" }, { label: state }]} />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">
            {state === "Signup" ? "Create Account" : "Login"}
          </h1>

          {/* General error message display */}
          {errors.general && (
            <div className="auth-page__error" role="alert">
              {errors.general}
            </div>
          )}

          {state === "Login" ? (
            <LoginForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading}
              errors={errors}
              handleSubmit={handleSubmit}
              isOffline={isOffline}
            />
          ) : (
            <SignupForm
              formData={formData}
              changeHandler={changeHandler}
              loading={loading}
              errors={errors}
              handleSubmit={handleSubmit}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              passwordValidation={passwordValidation}
              isOffline={isOffline}
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

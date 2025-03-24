import React, { useEffect, useContext } from "react";
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

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

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
  } = useAuthForm();

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

  // Show loading while auth state is being determined.
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

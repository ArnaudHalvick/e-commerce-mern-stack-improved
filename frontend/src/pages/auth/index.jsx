import React from "react";
import { Link } from "react-router-dom";

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
 */
const Auth = () => {
  const {
    state,
    formData,
    termsAccepted,
    loading,
    error,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
  } = useAuthForm();

  return (
    <div className="auth-container">
      <Breadcrumb routes={[{ label: "HOME", path: "/" }, { label: state }]} />
      <div className="loginsignup">
        <div className="signup-container">
          <h1>{state === "Signup" ? "Create Account" : "Login"}</h1>

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
            />
          )}

          <p className="signup-login">
            {state === "Signup"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Link to="/login" onClick={switchState}>
              {state === "Signup" ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

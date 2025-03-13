import React from "react";
import { Link } from "react-router-dom";

// Components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Hooks
import useAuthForm from "./hooks/useAuthForm";

// Styles
import "../CSS/Auth.css";

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

  const signup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation
    if (formData.username.trim() === "") {
      setError("Username is required");
      setLoading(false);
      return;
    }
    if (formData.email.trim() === "") {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (formData.password.trim() === "") {
      setError("Password is required");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await authContext.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Redirect to verification pending page
        navigate("/verify-pending", {
          state: { email: formData.email },
        });
      } else {
        setError(result.message || "Failed to create account");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

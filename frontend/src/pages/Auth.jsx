// Path: frontend/src/pages/Auth.jsx
import "./CSS/Auth.css";

import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";
// TODO: Work on responsiveness and auth pages after backend is done

// Simple breadcrumb component for auth page

const Auth = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, signup, loading, error } = useContext(AuthContext);

  const switchState = () => {
    setState((prevState) => (prevState === "Signup" ? "Login" : "Signup"));
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "Signup" && !termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (state === "Login") {
      await login(formData.email, formData.password);
    } else {
      await signup(formData);
    }
  };

  return (
    <div className="auth-container">
      <Breadcrumb routes={[{ label: "HOME", path: "/" }, { label: state }]} />
      <div className="loginsignup">
        <div className="signup-container">
          <h1>{state === "Signup" ? "Create Account" : "Login"}</h1>
          <form onSubmit={handleSubmit}>
            <div className="signup-fields">
              {state === "Signup" && (
                <input
                  type="text"
                  placeholder="Your name"
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                  required
                  autoComplete="name"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                name="email"
                value={formData.email}
                onChange={changeHandler}
                required
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={changeHandler}
                required
                autoComplete={
                  state === "Login" ? "current-password" : "new-password"
                }
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading
                ? "Loading..."
                : state === "Signup"
                ? "Create Account"
                : "Login"}
            </button>
          </form>
          <p className="signup-login">
            {state === "Signup"
              ? "Already have an account? "
              : "Don't have an account? "}
            <Link to="/login" onClick={switchState}>
              {state === "Signup" ? "Sign in" : "Sign up"}
            </Link>
          </p>
          {state === "Signup" && (
            <div className="signup-agree">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <p>
                By creating an account, I agree to the Terms of Service and
                Privacy Policy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

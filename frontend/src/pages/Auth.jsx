// Path: frontend/src/pages/Auth.jsx
import "./CSS/Auth.css";

import { Link } from "react-router-dom";
import { useState } from "react";
// TODO: Work on responsiveness and auth pages after backend is done

const Auth = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const switchState = () => {
    setState((prevState) => (prevState === "Signup" ? "Login" : "Signup"));
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    let responseData;
    await fetch("http://localhost:4000/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        responseData = data;
      });

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/"); // Replace this with React Router Navigate
    } else {
      alert(responseData.message); // Alert the user if login fails
    }
  };

  const signup = async () => {
    let responseData;
    await fetch("http://localhost:4000/api/signup", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        Accept: "application/form-data",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        responseData = data;
      });

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/"); // Replace this with React Router Navigate
    }
  };

  return (
    <div className="loginsignup">
      <div className="signup-container">
        <h1>{state === "Signup" ? "Create Account" : "Login"}</h1>
        <div className="signup-fields">
          {state === "Signup" && (
            <input
              type="text"
              placeholder="Your name"
              name="username"
              value={formData.username}
              onChange={changeHandler}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
          />
        </div>
        <button onClick={state === "Signup" ? signup : login}>
          {state === "Signup" ? "Create Account" : "Login"}
        </button>
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
            {/* TODO: Add some fake links to the terms and privacy policy and prevent the user from signing up if they don't agree */}
            <input type="checkbox" name="terms" id="terms" />
            <p>
              By creating an account, I agree to the Terms of Service and
              Privacy Policy Policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;

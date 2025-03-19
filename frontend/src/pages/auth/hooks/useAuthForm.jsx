import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import usePasswordValidation from "./usePasswordValidation";

/**
 * Custom hook for Auth form handling
 *
 * @returns {Object} Form handling methods and state
 */
const useAuthForm = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, signup, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password validation
  const {
    isValid: passwordValid,
    validLength,
    hasNumber,
    hasUppercase,
    specialChar,
    match,
    validationStarted,
    errors: passwordErrors,
  } = usePasswordValidation(formData.password, formData.confirmPassword);

  // Allow parent component to set the initial state
  const setInitialState = useCallback((newState) => {
    if (newState === "Login" || newState === "Signup") {
      setState(newState);
    }
  }, []);

  const switchState = () => {
    setState((prevState) => (prevState === "Signup" ? "Login" : "Signup"));
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "Signup") {
      if (!termsAccepted) {
        alert("Please accept the terms and conditions");
        return;
      }

      // Check password validation
      if (!passwordValid) {
        // Filter for only errors that apply
        const activeErrors = passwordErrors.filter((error) => {
          if (error.includes("match") && !formData.confirmPassword) {
            return false;
          }
          return true;
        });

        if (activeErrors.length > 0) {
          alert(
            `Please fix the following password issues:\n${activeErrors.join(
              "\n"
            )}`
          );
          return;
        }
      }

      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Prepare data for signup including passwordConfirm
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      };

      const result = await signup(signupData);

      // Check if signup requires email verification
      if (result && result.success && result.requiresVerification) {
        // Redirect to verification pending page with email
        navigate("/verify-pending", {
          state: { email: formData.email },
        });
      }
    } else {
      const loginResult = await login(formData.email, formData.password);
      // Email verification needed is handled at the Auth component level
    }
  };

  return {
    state,
    formData,
    termsAccepted,
    loading,
    error,
    passwordValidation: {
      validLength,
      hasNumber,
      hasUppercase,
      specialChar,
      match,
      validationStarted,
      isValid: passwordValid,
    },
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
  };
};

export default useAuthForm;

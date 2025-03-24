// frontend/src/pages/auth/hooks/useAuthForm.jsx

import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import usePasswordValidation from "./usePasswordValidation";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import useAsync from "../../../hooks/useAsync";
import useNetwork from "../../../hooks/useNetwork";
import { formatApiError } from "../../../utils/apiErrorUtils";

const useAuthForm = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const {
    login: authLogin,
    signup: authSignup,
    error: authError,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();

  const {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setMultipleErrors,
    handleApiError,
  } = useFormErrors();

  const { isOnline } = useNetwork({
    showToasts: true,
    offlineMessage: "You are currently offline. Please reconnect to continue.",
  });

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

  const { execute: executeLogin, loading: loginLoading } = useAsync(
    async (email, password) => {
      clearAllErrors();
      return await authLogin(email, password);
    },
    {
      showErrorToast: false,
      onSuccess: () => {
        showSuccess("Login successful!");
      },
      onError: (error) => {
        const formattedError = formatApiError(error);
        handleApiError(formattedError);
        if (error.emailVerificationNeeded) {
          navigate("/verify-pending", {
            state: { email: formData.email },
          });
        }
      },
    }
  );

  const { execute: executeSignup, loading: signupLoading } = useAsync(
    async (userData) => {
      clearAllErrors();
      return await authSignup(userData);
    },
    {
      showErrorToast: false,
      onSuccess: (result) => {
        showSuccess("Account created successfully!");
        if (result && result.success && result.requiresVerification) {
          navigate("/verify-pending", {
            state: { email: formData.email },
          });
        }
      },
      onError: (error) => {
        const formattedError = formatApiError(error);
        handleApiError(formattedError);
      },
    }
  );

  // Allow parent component to set the initial state
  const setInitialState = useCallback(
    (newState) => {
      if (newState === "Login" || newState === "Signup") {
        setState(newState);
        clearAllErrors();
      }
    },
    [clearAllErrors]
  );

  const switchState = () => {
    setState((prev) => (prev === "Login" ? "Signup" : "Login"));
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    clearAllErrors();
    setTermsAccepted(false);
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      clearFieldError(name);
    }
    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldError("email", "Please enter a valid email address");
      }
    }
  };

  const validateLoginForm = () => {
    let isValid = true;
    clearAllErrors();
    if (!formData.email.trim()) {
      setFieldError("email", "Email is required");
      isValid = false;
    }
    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
      isValid = false;
    }
    return isValid;
  };

  const validateSignupForm = () => {
    let isValid = true;
    clearAllErrors();
    if (!formData.username.trim()) {
      setFieldError("username", "Name is required");
      isValid = false;
    }
    if (!formData.email.trim()) {
      setFieldError("email", "Email is required");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFieldError("email", "Please enter a valid email address");
        isValid = false;
      }
    }
    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
      isValid = false;
    } else if (!passwordValid) {
      const activeErrors = passwordErrors.filter((error) => {
        if (error.includes("match") && !formData.confirmPassword) {
          return false;
        }
        return true;
      });
      if (activeErrors.length > 0) {
        setFieldError("password", "Password does not meet the requirements");
        isValid = false;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setFieldError("confirmPassword", "Passwords do not match");
      isValid = false;
    }
    if (!termsAccepted) {
      setFieldError("terms", "You must accept the terms and conditions");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOnline) {
      showError(
        "You are offline. Please check your internet connection and try again."
      );
      return;
    }
    if (state === "Signup") {
      if (!validateSignupForm()) return;
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      };
      await executeSignup(signupData);
    } else {
      if (!validateLoginForm()) return;
      await executeLogin(formData.email, formData.password);
    }
  };

  // Use a ref to ensure we process the auth error only once per change.
  const authErrorProcessed = useRef(false);

  useEffect(() => {
    if (authError && !authErrorProcessed.current) {
      if (typeof authError === "string") {
        setFieldError("general", authError);
      } else if (authError.fieldErrors) {
        setMultipleErrors(authError.fieldErrors);
      }
      authErrorProcessed.current = true;
    } else if (!authError) {
      authErrorProcessed.current = false;
    }
  }, [authError, setFieldError, setMultipleErrors]);

  return {
    state,
    formData,
    termsAccepted,
    loading: loginLoading || signupLoading,
    errors,
    passwordValidation: {
      validLength,
      hasNumber,
      hasUppercase,
      specialChar,
      match,
      validationStarted,
      isValid: passwordValid,
    },
    isOffline: !isOnline,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
  };
};

export default useAuthForm;

import { useState, useContext, useCallback, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import usePasswordValidation from "./usePasswordValidation";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import useAsync from "../../../hooks/useAsync";
import useNetwork from "../../../hooks/useNetwork";
import { formatApiError } from "../../../utils/apiErrorUtils";

/**
 * Custom hook for Auth form handling with comprehensive error handling
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
  const {
    login: authLogin,
    signup: authSignup,
    error: authError,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();

  // Form errors management
  const {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setMultipleErrors,
    handleApiError,
  } = useFormErrors();

  // Network connectivity monitoring
  const { isOnline } = useNetwork({
    showToasts: true,
    offlineMessage: "You are currently offline. Please reconnect to continue.",
  });

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

  // Login with useAsync
  const { execute: executeLogin, loading: loginLoading } = useAsync(
    async (email, password) => {
      // Clear all previous errors
      clearAllErrors();
      return await authLogin(email, password);
    },
    {
      showErrorToast: false, // We'll handle errors manually
      onSuccess: (data) => {
        showSuccess("Login successful!");
      },
      onError: (error) => {
        const formattedError = formatApiError(error);
        handleApiError(formattedError);

        // Check if email verification is needed
        if (error.emailVerificationNeeded) {
          navigate("/verify-pending", {
            state: { email: formData.email },
          });
        }
      },
    }
  );

  // Signup with useAsync
  const { execute: executeSignup, loading: signupLoading } = useAsync(
    async (userData) => {
      // Clear all previous errors
      clearAllErrors();
      return await authSignup(userData);
    },
    {
      showErrorToast: false, // We'll handle errors manually
      onSuccess: (result) => {
        showSuccess("Account created successfully!");
        // Check if signup requires email verification
        if (result && result.success && result.requiresVerification) {
          // Redirect to verification pending page with email
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
    setState((prevState) => (prevState === "Login" ? "Signup" : "Login"));
    // Clear form data and errors when switching states
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

    // Clear field error when user starts typing
    if (errors[name]) {
      clearFieldError(name);
    }

    // Validate email format
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

    // Validate email
    if (!formData.email.trim()) {
      setFieldError("email", "Email is required");
      isValid = false;
    }

    // Validate password
    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
      isValid = false;
    }

    return isValid;
  };

  const validateSignupForm = () => {
    let isValid = true;
    clearAllErrors();

    // Validate username
    if (!formData.username.trim()) {
      setFieldError("username", "Name is required");
      isValid = false;
    }

    // Validate email
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

    // Validate password
    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
      isValid = false;
    } else if (!passwordValid) {
      // Set all password validation errors
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

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFieldError("confirmPassword", "Passwords do not match");
      isValid = false;
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      setFieldError("terms", "You must accept the terms and conditions");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for network connectivity
    if (!isOnline) {
      showError(
        "You are offline. Please check your internet connection and try again."
      );
      return;
    }

    if (state === "Signup") {
      if (!validateSignupForm()) {
        return;
      }

      // Prepare data for signup
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      };

      await executeSignup(signupData);
    } else {
      if (!validateLoginForm()) {
        return;
      }

      await executeLogin(formData.email, formData.password);
    }
  };

  // Use useEffect to safely process auth errors
  useEffect(() => {
    if (authError && Object.keys(errors).length === 0) {
      if (typeof authError === "string") {
        setFieldError("general", authError);
      } else if (authError.fieldErrors) {
        setMultipleErrors(authError.fieldErrors);
      }
    }
  }, [authError, errors, setFieldError, setMultipleErrors]);

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

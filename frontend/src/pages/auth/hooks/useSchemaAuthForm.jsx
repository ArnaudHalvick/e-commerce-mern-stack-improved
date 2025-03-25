import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import useAsync from "../../../hooks/useAsync";
import useNetwork from "../../../hooks/useNetwork";
import useSchemaValidation from "../../../hooks/useSchemaValidation";
import { formatApiError } from "../../../utils/apiErrorUtils";

/**
 * Custom hook for auth forms (login/signup) with backend schema validation
 * This is an enhanced version of useAuthForm that uses the backend validation schema
 */
const useSchemaAuthForm = () => {
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

  // Use backend schema validation for registration forms
  const {
    validateField,
    validateForm,
    isLoading: schemaLoading,
    schema: validationSchema,
  } = useSchemaValidation("registration", true);

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

  // Track if validation has started for visual feedback
  const [validationStarted, setValidationStarted] = useState({
    password: false,
    confirmPassword: false,
    email: false,
  });

  // Login execution
  const { execute: executeLogin, loading: loginLoading } = useAsync(
    async (email, password) => {
      clearAllErrors();
      return await authLogin(email, password);
    },
    {
      showErrorToast: false,
      onSuccess: (result) => {
        if (result && result.success) {
          showSuccess("Login successful!");
        } else {
          // Handle unsuccessful login even though API call succeeded
          const errorMessage =
            result?.message || "Login failed. Please check your credentials.";
          showError(errorMessage);
          setFieldError("general", errorMessage);
        }
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

  // Signup execution
  const { execute: executeSignup, loading: signupLoading } = useAsync(
    async (userData) => {
      clearAllErrors();
      return await authSignup(userData);
    },
    {
      showErrorToast: false,
      onSuccess: (result) => {
        if (result && result.success) {
          showSuccess("Account created successfully!");

          if (result.requiresVerification) {
            // Ensure we wait for the redirect
            setTimeout(() => {
              navigate("/verify-pending", {
                state: { email: formData.email },
                replace: true, // Use replace to avoid back button issues
              });
            }, 0);
          }
        } else {
          // Handle unsuccessful signup even though API call succeeded
          const errorMessage =
            result?.message || "Signup failed. Please try again.";
          showError(errorMessage);
          setFieldError("general", errorMessage);
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

  // Switch between login and signup forms
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
    setValidationStarted({
      password: false,
      confirmPassword: false,
      email: false,
    });
  };

  // Handle form input changes
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear previous error for this field
    if (errors[name]) {
      clearFieldError(name);
    }

    // Track validation has started for fields
    if (name === "password" || name === "confirmPassword" || name === "email") {
      setValidationStarted((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    // Validate field with backend schema
    if (validationSchema && validationStarted[name]) {
      const error = validateField(name, value);
      if (error) {
        setFieldError(name, error);
      } else {
        // Clear error when input becomes valid
        clearFieldError(name);
      }
    }
  };

  // Validate login form
  const validateLoginForm = () => {
    let isValid = true;
    clearAllErrors();

    // Always check for empty fields
    if (!formData.email.trim()) {
      setFieldError("email", "Email is required");
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setFieldError("email", "Please enter a valid email address");
        isValid = false;
      }
    }

    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
      isValid = false;
    } else if (formData.password.trim().length < 6) {
      // Basic minimum length check
      setFieldError("password", "Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  // Validate signup form using schema validation
  const validateSignupForm = () => {
    clearAllErrors();

    // Validate all fields with backend schema
    const validationErrors = validateForm({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.confirmPassword,
    });

    // Check for terms acceptance
    if (!termsAccepted) {
      validationErrors.terms = "You must accept the terms and conditions";
    }

    // Apply errors to form state
    if (Object.keys(validationErrors).length > 0) {
      setMultipleErrors(validationErrors);
      return false;
    }

    return true;
  };

  // Handle form submission
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

  // Check password validity against schema requirements
  const checkPasswordValidity = () => {
    if (!validationSchema || !validationSchema.password) {
      return {
        validLength: false,
        hasNumber: false,
        hasUppercase: false,
        specialChar: false,
        match: false,
        validationStarted: false,
        isValid: false,
      };
    }

    // Extract password requirements from schema
    const passwordSchema = validationSchema.password;
    const minLength = passwordSchema.minLength || 8;

    // Determine if requirements exist in the schema
    const requiresUppercase = passwordSchema.requiresUppercase || false;
    const requiresNumber = passwordSchema.requiresNumber || false;
    const requiresSpecial = passwordSchema.requiresSpecial || false;

    // Check actual password against requirements
    const validLength = formData.password.length >= minLength;
    const hasUppercase = !requiresUppercase || /[A-Z]/.test(formData.password);
    const hasNumber = !requiresNumber || /\d/.test(formData.password);
    const specialChar =
      !requiresSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    // Password matching check
    const match =
      formData.password === formData.confirmPassword &&
      formData.password !== "";

    // Determine if validation has started
    const hasStarted = validationStarted.password;

    // Password is valid if it meets all requirements
    const isValid =
      validLength &&
      hasUppercase &&
      hasNumber &&
      specialChar &&
      match &&
      hasStarted;

    return {
      validLength,
      hasNumber,
      hasUppercase,
      specialChar,
      match,
      validationStarted: hasStarted,
      isValid,
    };
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
    loading: loginLoading || signupLoading || schemaLoading,
    errors,
    passwordValidation: checkPasswordValidity(),
    schema: validationSchema,
    isOffline: !isOnline,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
  };
};

export default useSchemaAuthForm;

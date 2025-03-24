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
    error: schemaError,
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
  });

  // Login execution
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

  // Signup execution
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

    // Add explicit email validation with clearing
    if (name === "email") {
      if (value && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          // Email is valid, clear any existing error
          clearFieldError("email");
        }
      }
    }

    // Track validation has started for password fields
    if (name === "password" || name === "confirmPassword") {
      setValidationStarted((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    // Validate field with backend schema and clear error if valid
    if (validationSchema && name !== "confirmPassword") {
      const error = validateField(name, value);
      if (error) {
        setFieldError(name, error);
      } else {
        // Clear error when input becomes valid
        clearFieldError(name);
      }
    }

    // Special handling for confirm password
    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      if (name === "confirmPassword" && value !== formData.password) {
        setFieldError("confirmPassword", "Passwords do not match");
      } else if (
        name === "password" &&
        value !== formData.confirmPassword &&
        formData.confirmPassword
      ) {
        setFieldError("confirmPassword", "Passwords do not match");
      } else {
        // Clear error when passwords match
        clearFieldError("confirmPassword");
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
    }

    if (!formData.password.trim()) {
      setFieldError("password", "Password is required");
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

  // Process auth errors
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

  // Check password against schema requirements
  const checkPasswordValidity = () => {
    if (!formData.password) {
      return {
        validLength: false,
        hasUppercase: false,
        hasNumber: false,
        specialChar: false,
        match: false,
        isValid: false,
      };
    }

    // If we have validation schema, use it
    if (validationSchema?.password) {
      const schema = validationSchema.password;
      // Make sure to use minLength as a number, not an array
      const minLength =
        typeof schema.minLength === "number"
          ? schema.minLength
          : Array.isArray(schema.minLength)
          ? schema.minLength[0]
          : 8;

      // Check each requirement
      const checks = {
        validLength: formData.password.length >= minLength,
        hasUppercase: /[A-Z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
        match: formData.confirmPassword
          ? formData.password === formData.confirmPassword
          : false,
      };

      // A password is valid if it meets all the actual requirements
      checks.isValid =
        checks.validLength &&
        checks.hasUppercase &&
        checks.hasNumber &&
        checks.specialChar;

      return checks;
    }

    // If no schema available yet, return reasonable defaults
    return {
      validLength: false,
      hasUppercase: false,
      hasNumber: false,
      specialChar: false,
      match: formData.confirmPassword
        ? formData.password === formData.confirmPassword
        : false,
      isValid: false,
    };
  };

  // Get password validation state for UI feedback
  const passwordValidation = {
    ...checkPasswordValidity(),
    validationStarted: validationStarted.password,
  };

  return {
    state,
    formData,
    termsAccepted,
    loading: loginLoading || signupLoading || schemaLoading,
    errors,
    passwordValidation,
    isOffline: !isOnline,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
    setInitialState,
    validationSchema,
  };
};

export default useSchemaAuthForm;

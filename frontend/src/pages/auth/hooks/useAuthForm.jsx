import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../api";
import useErrorRedux from "../../../hooks/useErrorRedux";
import { useAuth } from "../../../hooks/state";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
} from "../../../utils/validation";

// Import validation schemas
import {
  loginFormSchema,
  registrationFormSchema,
} from "../../../utils/validationSchemas";

// Import our form handler
import useFormHandler from "./useFormHandler";

/**
 * Custom hook for managing auth forms (login/register)
 *
 * @param {string} formType - The type of form ('login' or 'register')
 * @returns {Object} Form state and handlers
 */
const useAuthForm = (formType = "login") => {
  const navigate = useNavigate();
  const { showSuccess } = useErrorRedux();
  const { login } = useAuth();

  // Initial form data
  const initialFormData = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  // State to store password temporarily for use in validation
  // This fixes the "used before defined" issue with formData
  const [password, setPassword] = useState("");

  // Use form schemas for validation rules
  const validationRules = useMemo(
    () => ({
      login: loginFormSchema,
      register: registrationFormSchema,
    }),
    []
  );

  /**
   * Validate a single field
   */
  const validateField = useCallback((name, value, currentPassword) => {
    let errorMessage = "";

    switch (name) {
      case "username": {
        const result = validateName(value);
        if (!result.isValid) errorMessage = result.message;
        break;
      }
      case "email": {
        const result = validateEmail(value);
        if (!result.isValid) errorMessage = result.message;
        break;
      }
      case "password": {
        const result = validatePassword(value);
        if (!result.isValid) errorMessage = result.message;
        break;
      }
      case "confirmPassword": {
        const result = validatePasswordMatch(currentPassword, value);
        if (!result.isValid) errorMessage = result.message;
        break;
      }
      default:
        break;
    }

    return errorMessage;
  }, []);

  // Create a temporary state for field errors to avoid the circular dependency
  const [tempFieldErrors, setTempFieldErrors] = useState({});

  // Create field validator that includes password from state
  const fieldValidator = useCallback(
    (name, value) => {
      const errorMessage = validateField(name, value, password);

      // Update our temporary field errors state
      setTempFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));

      // If the field is password, update our password state
      if (name === "password") {
        setPassword(value);
      }

      return errorMessage === "";
    },
    [validateField, password]
  );

  // Use our common form handler
  const {
    formData,
    loading,
    setLoading,
    fieldErrors,
    setFieldErrors,
    formErrors,
    clearFormError,
    setFormError,
    handleChange,
    handleBlur,
    validateFormData,
  } = useFormHandler(
    initialFormData,
    validationRules[formType],
    fieldValidator
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      clearFormError();

      if (!validateFormData()) return;

      setLoading(true);

      try {
        if (formType === "login") {
          // Call the auth API to get the token
          const result = await authService.login(
            formData.email,
            formData.password
          );
          if (result.success) {
            // Use the login function from AuthContext which handles clearing the
            // 'user-logged-out' flag, storing the token, and updating the auth state.
            login(formData.email, formData.password);
            return { success: true };
          } else {
            setFieldErrors({
              general: result.message || "Login failed. Please try again.",
            });
          }
        } else {
          const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };
          const result = await authService.register(userData);
          if (result.success) {
            showSuccess(
              "Registration successful! Please check your email to verify your account."
            );
            navigate("/verify-pending", {
              replace: true,
              state: { email: formData.email },
            });
            return { success: true };
          } else {
            setFieldErrors({
              general:
                result.message || "Registration failed. Please try again.",
            });
          }
        }
      } catch (error) {
        console.error(
          `${formType === "login" ? "Login" : "Registration"} error:`,
          error
        );
        setFormError(error);
      } finally {
        setLoading(false);
      }

      return { success: false };
    },
    [
      formData,
      formType,
      navigate,
      clearFormError,
      setFormError,
      validateFormData,
      showSuccess,
      login,
      setLoading,
      setFieldErrors,
    ]
  );

  return {
    formData,
    loading,
    fieldErrors: { ...fieldErrors, ...tempFieldErrors },
    handleChange,
    handleSubmit,
    handleBlur,
    formErrors,
  };
};

export default useAuthForm;

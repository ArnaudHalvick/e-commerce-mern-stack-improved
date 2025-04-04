import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../api";
import useErrorRedux from "../../../hooks/useErrorRedux";
// Import the useAuth hook from the state directory
import { useAuth } from "../../../hooks/state";
import useFormErrors from "../../../hooks/useFormErrors";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  validateForm,
  isFormValid,
} from "../../../utils/validation";

// Import validation schemas for form validation rules
import {
  loginFormSchema,
  registrationFormSchema,
} from "../../../utils/validationSchemas";

/**
 * Custom hook for managing auth forms (login/register)
 *
 * @param {string} formType - The type of form ('login' or 'register')
 * @returns {Object} Form state and handlers
 */
const useAuthForm = (formType = "login") => {
  const navigate = useNavigate();
  const {
    errors: formErrors,
    clearAllErrors: clearFormError,
    handleApiError: setFormError,
  } = useFormErrors();
  const { showSuccess } = useErrorRedux();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
  const validateField = useCallback(
    (name, value) => {
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
          const result = validatePasswordMatch(formData.password, value);
          if (!result.isValid) errorMessage = result.message;
          break;
        }
        default:
          break;
      }

      setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
      return errorMessage === "";
    },
    [formData.password]
  );

  /**
   * Validate the entire form
   */
  const validateFormData = useCallback(() => {
    const errors = validateForm(formData, validationRules[formType]);
    setFieldErrors(errors);
    return isFormValid(errors);
  }, [formData, formType, validationRules]);

  /**
   * Handle input changes
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors.general) clearFormError();
    },
    [formErrors, clearFormError]
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
    ]
  );

  /**
   * Handle blur event (validate field on blur)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      validateField(name, value);
    },
    [validateField]
  );

  return {
    formData,
    loading,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleBlur,
    formErrors,
  };
};

export default useAuthForm;

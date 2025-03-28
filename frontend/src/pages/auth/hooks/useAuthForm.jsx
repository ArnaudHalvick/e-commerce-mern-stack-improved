import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../../services/authApi";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  validateForm,
  isFormValid,
} from "../../../utils/validation";

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
  const { showSuccess } = useError();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Define validation rules for each form type
  const validationRules = useMemo(
    () => ({
      login: { email: true, password: true },
      register: {
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      },
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
          const result = await authApi.login(formData.email, formData.password);
          if (result.success) {
            if (result.accessToken) {
              localStorage.setItem("auth-token", result.accessToken);
            }
            // Let AuthContext handle further navigation
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
          const result = await authApi.register(userData);
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

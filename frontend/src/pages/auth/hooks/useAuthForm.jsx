import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

  // Define which validation rules to use for each form type
  const validationRules = useMemo(
    () => ({
      login: {
        email: true,
        password: true,
      },
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
        case "username":
          const nameResult = validateName(value);
          if (!nameResult.isValid) errorMessage = nameResult.message;
          break;

        case "email":
          const emailResult = validateEmail(value);
          if (!emailResult.isValid) errorMessage = emailResult.message;
          break;

        case "password":
          const passwordResult = validatePassword(value);
          if (!passwordResult.isValid) errorMessage = passwordResult.message;
          break;

        case "confirmPassword":
          const matchResult = validatePasswordMatch(formData.password, value);
          if (!matchResult.isValid) errorMessage = matchResult.message;
          break;

        default:
          break;
      }

      setFieldErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));

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

      // Clear any form-level errors when user starts typing
      if (formErrors.general) {
        clearFormError();
      }
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

      // Validate form
      if (!validateFormData()) {
        return;
      }

      setLoading(true);

      try {
        if (formType === "login") {
          const result = await authApi.login(formData.email, formData.password);

          if (result.success) {
            // Store auth token if returned
            if (result.accessToken) {
              localStorage.setItem("auth-token", result.accessToken);
            }
            // Don't navigate here - let the AuthContext handle navigation
            return { success: true };
          } else {
            // If API returns success: false but no error thrown
            setFieldErrors({
              general: result.message || "Login failed. Please try again.",
            });
          }
        } else {
          // Prepare data for registration - backend expects username, email, password
          const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          };

          const result = await authApi.register(userData);

          if (result.success) {
            // Show success message
            showSuccess(
              "Registration successful! Please check your email to verify your account."
            );

            // Navigate to login page
            navigate("/login", { replace: true });
            return { success: true };
          } else {
            // If API returns success: false but no error thrown
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
        // handleError will set form errors via the useFormErrors hook
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
      setFieldErrors,
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

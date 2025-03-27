import { useState, useCallback } from "react";
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
    setFieldError,
    clearAllErrors: clearFormError,
    handleApiError: setFormError,
  } = useFormErrors();
  const { showSuccess } = useError();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Define which validation rules to use for each form type
  const validationRules = {
    login: {
      email: true,
      password: true,
    },
    register: {
      name: true,
      email: true,
      password: true,
      passwordConfirm: true,
    },
  };

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name, value) => {
      let errorMessage = "";

      switch (name) {
        case "name":
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

        case "passwordConfirm":
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
        // Determine redirect path
        const redirect = location.state?.from?.pathname || "/";

        if (formType === "login") {
          const result = await authApi.login(formData.email, formData.password);

          if (result.success) {
            // Store auth token if returned
            if (result.token) {
              localStorage.setItem("auth-token", result.token);
            }
            navigate(redirect);
          }
        } else {
          const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm,
          };

          const result = await authApi.register(userData);

          if (result.success) {
            // Show success message
            showSuccess(
              "Registration successful! Please check your email to verify your account."
            );

            // Navigate to login page
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        // handleError will set form errors via the useFormErrors hook
        setFormError(error);
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      formType,
      navigate,
      location.state?.from?.pathname,
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

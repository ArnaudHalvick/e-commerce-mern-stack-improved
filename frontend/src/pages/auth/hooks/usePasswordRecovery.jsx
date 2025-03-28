// frontend/src/pages/auth/hooks/usePasswordRecovery.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import authApi from "../../../services/authApi";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateForm,
  isFormValid,
} from "../../../utils/validation";

// Import appropriate schemas
import { passwordResetFormSchema } from "../../../utils/validationSchemas";

/**
 * Custom hook for password recovery functionality
 * Handles both the forgot password and reset password flows
 *
 * @param {string} mode - 'forgot' or 'reset'
 * @param {string} token - Reset token for password reset mode
 * @returns {Object} State and handlers for the password recovery form
 */
const usePasswordRecovery = (mode = "forgot", token = "") => {
  const {
    errors: formErrors,
    clearAllErrors: clearFormError,
    handleApiError: setFormError,
  } = useFormErrors();
  const { showSuccess } = useError();

  // Initialize form data based on mode
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    token: token || "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Set token when it's provided
  useEffect(() => {
    if (token) {
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [token]);

  // Define validation rules based on mode, using imported schema for reset mode
  const validationRules = useMemo(
    () => ({
      forgot: {
        email: true,
      },
      reset: passwordResetFormSchema,
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

        case "token":
          if (!value || value.trim() === "") {
            errorMessage = "Reset token is required";
          } else if (value.length < 10) {
            errorMessage = "Invalid reset token";
          }
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
    const errors = validateForm(formData, validationRules[mode]);
    setFieldErrors(errors);
    return isFormValid(errors);
  }, [formData, mode, validationRules]);

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
      setSuccess(false);

      // Validate form
      if (!validateFormData()) {
        return;
      }

      setLoading(true);

      try {
        if (mode === "forgot") {
          try {
            const result = await authApi.forgotPassword(formData.email);

            if (result.success) {
              setSuccess(true);
              showSuccess("Password reset instructions sent to your email");
            }
          } catch (error) {
            // Don't redirect if we get a 401 during password recovery
            if (error.status === 401 && error.message.includes("logged out")) {
              setFormError({
                message:
                  "Please enter your email to receive recovery instructions",
              });
            } else {
              setFormError(error);
            }
            setSuccess(false);
          }
        } else {
          try {
            const result = await authApi.resetPassword(
              formData.token,
              formData.password,
              formData.confirmPassword
            );

            if (result.success) {
              setSuccess(true);
              showSuccess("Password has been reset successfully");
            }
          } catch (error) {
            // Don't redirect if we get a 401 during password reset
            if (error.status === 401 && error.message.includes("logged out")) {
              setFormError({
                message:
                  "Your password reset link may have expired. Please request a new one.",
              });
            } else {
              setFormError(error);
            }
            setSuccess(false);
          }
        }
      } catch (error) {
        setFormError(error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      mode,
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
    success,
    fieldErrors,
    formErrors,
    handleChange,
    handleSubmit,
    handleBlur,
    validatePassword: (password) => validateField("password", password),
    validatePasswordMatch: (password, confirm) => {
      setFormData((prev) => ({ ...prev, password, confirmPassword: confirm }));
      return validateField("confirmPassword", confirm);
    },
  };
};

export default usePasswordRecovery;

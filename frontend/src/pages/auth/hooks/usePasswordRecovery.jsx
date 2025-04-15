// frontend/src/pages/auth/hooks/usePasswordRecovery.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../api";
import useErrorRedux from "../../../hooks/useErrorRedux";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from "../../../utils/validation";

// Import appropriate schemas
import { passwordResetFormSchema } from "../../../utils/validationSchemas";

// Import our form handler
import useFormHandler from "./useFormHandler";

/**
 * Custom hook for password recovery functionality
 * Handles both the forgot password and reset password flows
 *
 * @param {string} mode - 'forgot' or 'reset'
 * @param {string} token - Reset token for password reset mode
 * @param {boolean} redirectAfterReset - Whether to redirect after successful reset
 * @returns {Object} State and handlers for the password recovery form
 */
const usePasswordRecovery = (
  mode = "forgot",
  token = "",
  redirectAfterReset = true
) => {
  const navigate = useNavigate();
  const { showSuccess } = useErrorRedux();

  // Initialize form data based on mode
  const initialFormData = {
    email: "",
    password: "",
    confirmPassword: "",
    token: token || "",
  };

  const [success, setSuccess] = useState(false);

  // State to store password temporarily for use in validation
  // This fixes the "used before defined" issue with formData
  const [password, setPassword] = useState("");

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
  const validateField = useCallback((name, value, currentPassword) => {
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
        const matchResult = validatePasswordMatch(currentPassword, value);
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

    return errorMessage;
  }, []);

  // Create a temporary state for field errors to avoid the circular dependency
  const [tempFieldErrors, setTempFieldErrors] = useState({});

  // Create field validator that includes password from state
  const fieldValidator = useCallback(
    (name, value) => {
      const errorMessage = validateField(name, value, password);

      // Update our temporary field errors state
      setTempFieldErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));

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
    setFormData,
    loading,
    setLoading,
    fieldErrors,
    formErrors,
    clearFormError,
    setFormError,
    handleChange,
    handleBlur,
    validateFormData,
  } = useFormHandler(initialFormData, validationRules[mode], fieldValidator);

  // Set token when it's provided
  useEffect(() => {
    if (token) {
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [token, setFormData]);

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
            const result = await authService.forgotPassword(formData.email);

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
            const result = await authService.resetPassword(
              formData.token,
              formData.password
            );

            if (result.success) {
              setSuccess(true);
              showSuccess("Password has been reset successfully");

              // Redirect to login page after successful password reset
              if (redirectAfterReset) {
                setTimeout(() => {
                  navigate("/login", {
                    replace: true,
                    state: {
                      passwordResetSuccess: true,
                      message:
                        "Your password has been reset successfully. Please login with your new password.",
                    },
                  });
                }, 1500);
              }
            }
          } catch (error) {
            setFormError(error);
            setSuccess(false);
          }
        }
      } catch (error) {
        console.error("Password recovery error:", error);
        setFormError(error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [
      mode,
      formData,
      navigate,
      redirectAfterReset,
      clearFormError,
      setFormError,
      validateFormData,
      showSuccess,
      setLoading,
    ]
  );

  return {
    formData,
    loading,
    success,
    fieldErrors: { ...fieldErrors, ...tempFieldErrors },
    formErrors,
    handleChange,
    handleSubmit,
    handleBlur,
  };
};

export default usePasswordRecovery;

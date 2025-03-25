import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useError } from "../../../context/ErrorContext";
import useFormErrors from "../../../hooks/useFormErrors";
import useSchemaValidation from "../../../hooks/useSchemaValidation";
import useAsync from "../../../hooks/useAsync";
import usePasswordValidation from "./usePasswordValidation";
import authApi from "../../../services/authApi";
import { formatApiError } from "../../../utils/apiErrorUtils";

/**
 * Custom hook for handling password recovery and reset workflow
 * @returns {Object} Recovery state and handlers
 */
const usePasswordRecovery = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { showError, showSuccess } = useError();

  // Form states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Error handling
  const {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleApiError,
  } = useFormErrors();

  // Try to use schema validation, but handle failures gracefully
  const {
    validateField,
    validateForm,
    isLoading: schemaLoading,
    schema: validationSchema,
    error: schemaError,
  } = useSchemaValidation("password-reset", true);

  // Use basic password validation regardless of schema
  const passwordValidation = usePasswordValidation(
    resetFormData.password,
    resetFormData.confirmPassword
  );

  // Request password recovery email
  const { execute: executeRecoveryRequest, loading: recoveryLoading } =
    useAsync(
      async (email) => {
        clearAllErrors();
        return await authApi.forgotPassword(email);
      },
      {
        showErrorToast: true, // Enable toast for all errors
        onSuccess: (result) => {
          if (result && result.success) {
            setEmailSent(true);
            showSuccess(
              "Password recovery email sent. Please check your inbox."
            );
          } else {
            const errorMessage =
              result?.message || "Failed to send recovery email";
            showError(errorMessage);
            setFieldError("email", errorMessage);
          }
        },
        onError: (error) => {
          const formattedError = formatApiError(error);

          // Handle 404 error for non-existent email with a user-friendly message
          if (error.status === 404) {
            setFieldError("email", "No account found with this email address");
            // We don't need to call showError here since showErrorToast is true
          } else {
            handleApiError(formattedError);
          }
        },
      }
    );

  // Reset password with token
  const { execute: executePasswordReset, loading: resetLoading } = useAsync(
    async (data) => {
      clearAllErrors();
      return await authApi.resetPassword(
        token,
        data.password,
        data.confirmPassword
      );
    },
    {
      showErrorToast: true, // Enable toast for reset password errors
      onSuccess: (result) => {
        if (result && result.success) {
          showSuccess(
            "Password has been reset successfully. You can now log in."
          );
          navigate("/login", {
            replace: true,
            state: {
              message:
                "Password reset successful. Please log in with your new password.",
            },
          });
        } else {
          const errorMessage = result?.message || "Failed to reset password";
          showError(errorMessage);
          setFieldError("general", errorMessage);
        }
      },
      onError: (error) => {
        const formattedError = formatApiError(error);
        handleApiError(formattedError);

        if (formattedError.general) {
          showError(formattedError.general);
        }
      },
    }
  );

  // Handle forgot password form submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    // Validate email
    if (!forgotPasswordEmail.trim()) {
      setFieldError("email", "Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setFieldError("email", "Please enter a valid email address");
      return;
    }

    const result = await executeRecoveryRequest(forgotPasswordEmail);

    // If the result indicates a handled error, we don't need to do anything else
    // The error has already been handled by the onError callback in useAsync
    if (result && result.handled && result.error) {
      // Console log removed
    }
  };

  // Handle password reset form changes
  const handleResetFormChange = (e) => {
    const { name, value } = e.target;
    setResetFormData((prev) => ({ ...prev, [name]: value }));

    // Clear previous error
    if (errors[name]) {
      clearFieldError(name);
    }

    // Validate field with schema if available (but don't rely on it)
    if (validationSchema && !schemaError) {
      try {
        const fieldError = validateField(name, value);
        if (fieldError) {
          setFieldError(name, fieldError);
        }
      } catch (err) {
        // If schema validation fails, we'll just continue without it
        // Console log removed
      }
    }
  };

  // Handle password reset form submission
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    // Try to validate with schema, but don't rely on it
    let hasSchemaErrors = false;
    if (validationSchema && !schemaError) {
      try {
        const validationErrors = validateForm(resetFormData);
        if (Object.keys(validationErrors).length > 0) {
          Object.entries(validationErrors).forEach(([field, error]) => {
            setFieldError(field, error);
          });
          hasSchemaErrors = true;
        }
      } catch (err) {
        // If schema validation fails, we'll just continue with basic validation
        // Console log removed
      }
    }

    // If schema validation found errors, don't continue
    if (hasSchemaErrors) return;

    // Basic validation checks (always run these regardless of schema)
    if (!resetFormData.password) {
      setFieldError("password", "Password is required");
      return;
    }

    if (!resetFormData.confirmPassword) {
      setFieldError("confirmPassword", "Please confirm your password");
      return;
    }

    if (resetFormData.password !== resetFormData.confirmPassword) {
      setFieldError("confirmPassword", "Passwords do not match");
      return;
    }

    // Check password validation from the usePasswordValidation hook
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach((error) => {
        if (error.includes("match")) {
          setFieldError("confirmPassword", error);
        } else {
          setFieldError("password", error);
        }
      });
      return;
    }

    const result = await executePasswordReset(resetFormData);

    // If the result indicates a handled error, we don't need to do anything else
    if (result && result.handled && result.error) {
      // Console log removed
    }
  };

  return {
    forgotPasswordEmail,
    setForgotPasswordEmail,
    emailSent,
    resetFormData,
    errors,
    validationSchema,
    passwordValidation,
    recoveryLoading,
    resetLoading,
    schemaLoading,
    handleForgotPasswordSubmit,
    handleResetFormChange,
    handleResetSubmit,
  };
};

export default usePasswordRecovery;

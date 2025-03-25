import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResetPasswordForm } from "./components";
import { usePasswordRecovery } from "./hooks";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { useError } from "../../context/ErrorContext";

// Styles
import "./Auth.css";
import "../../components/form/FormInputField.css";
import "../../components/form/FormSubmitButton.css";

/**
 * Reset Password page component
 * Allows users to set a new password using a reset token
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showError } = useError();

  const {
    resetFormData,
    errors,
    validationSchema,
    passwordValidation,
    resetLoading,
    schemaLoading,
    handleResetFormChange,
    handleResetSubmit,
  } = usePasswordRecovery();

  // Validate that we have a token
  useEffect(() => {
    if (!token) {
      showError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
      navigate("/forgot-password", { replace: true });
    }
  }, [token, showError, navigate]);

  if (!token) {
    return null; // We'll redirect in the useEffect
  }

  return (
    <div className="auth-page">
      <Breadcrumb
        routes={[
          { label: "Home", path: "/" },
          { label: "Login", path: "/login" },
          { label: "Reset Password" },
        ]}
      />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">Reset Password</h1>

          {errors.general && (
            <div className="auth-page__error" role="alert">
              {errors.general}
            </div>
          )}

          <ResetPasswordForm
            formData={resetFormData}
            handleChange={handleResetFormChange}
            handleSubmit={handleResetSubmit}
            errors={errors}
            loading={resetLoading}
            passwordValidation={passwordValidation}
            validationSchema={validationSchema}
            isLoading={schemaLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

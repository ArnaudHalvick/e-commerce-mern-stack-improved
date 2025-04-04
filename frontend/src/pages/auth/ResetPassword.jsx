import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResetPasswordForm } from "./components";
import { usePasswordRecovery } from "./hooks";
import { usePasswordValidation } from "./hooks";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import useErrorRedux from "../../hooks/useErrorRedux";

// Styles
import "./Auth.css";

/**
 * Reset Password page component
 * Allows users to set a new password using a reset token
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showError } = useErrorRedux();

  const {
    formData,
    loading,
    fieldErrors,
    formErrors,
    handleChange,
    handleSubmit,
    handleBlur,
  } = usePasswordRecovery("reset", token);

  // Get password validation feedback
  const passwordValidation = usePasswordValidation(formData.password);

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

          {formErrors.general && (
            <div className="auth-page__error" role="alert">
              {formErrors.general}
            </div>
          )}

          <ResetPasswordForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleBlur={handleBlur}
            errors={fieldErrors}
            loading={loading}
            passwordValidation={passwordValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

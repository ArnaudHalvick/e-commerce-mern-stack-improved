import React from "react";
import { ForgotPasswordForm } from "./components";
import { usePasswordRecovery } from "./hooks";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Styles
import "./Auth.css";

/**
 * Forgot Password page component
 * Allows users to request a password reset link
 */
const ForgotPassword = () => {
  const {
    formData,
    loading,
    success,
    fieldErrors,
    formErrors,
    handleChange,
    handleSubmit,
  } = usePasswordRecovery("forgot");

  return (
    <div className="auth-page">
      <Breadcrumb
        routes={[
          { label: "Home", path: "/" },
          { label: "Login", path: "/login" },
          { label: "Forgot Password" },
        ]}
      />
      <div className="auth-page__content">
        <div className="auth-page__container">
          <h1 className="auth-page__title">Forgot Password</h1>

          {formErrors.general && (
            <div className="auth-page__error" role="alert">
              {formErrors.general}
            </div>
          )}

          <ForgotPasswordForm
            email={formData.email}
            setEmail={(value) =>
              handleChange({ target: { name: "email", value } })
            }
            handleSubmit={handleSubmit}
            errors={fieldErrors}
            loading={loading}
            emailSent={success}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

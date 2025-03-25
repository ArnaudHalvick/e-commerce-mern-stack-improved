import React from "react";
import { ForgotPasswordForm } from "./components";
import { usePasswordRecovery } from "./hooks";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Styles
import "./Auth.css";
import "../../components/form/FormInputField.css";
import "../../components/form/FormSubmitButton.css";

/**
 * Forgot Password page component
 * Allows users to request a password reset link
 */
const ForgotPassword = () => {
  const {
    forgotPasswordEmail,
    setForgotPasswordEmail,
    emailSent,
    errors,
    recoveryLoading,
    handleForgotPasswordSubmit,
  } = usePasswordRecovery();

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

          {errors.general && (
            <div className="auth-page__error" role="alert">
              {errors.general}
            </div>
          )}

          <ForgotPasswordForm
            email={forgotPasswordEmail}
            setEmail={setForgotPasswordEmail}
            handleSubmit={handleForgotPasswordSubmit}
            errors={errors}
            loading={recoveryLoading}
            emailSent={emailSent}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

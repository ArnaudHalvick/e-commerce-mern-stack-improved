import React from "react";
import { ForgotPasswordForm, AuthLayout } from "./components";
import { usePasswordRecovery } from "./hooks";

// Styles
import "./styles/index.css";

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
    <AuthLayout
      title="Forgot Password"
      breadcrumbRoutes={[
        { label: "Home", path: "/" },
        { label: "Login", path: "/login" },
        { label: "Forgot Password" },
      ]}
      errorMessage={formErrors.general}
    >
      <ForgotPasswordForm
        email={formData.email}
        setEmail={(value) => handleChange({ target: { name: "email", value } })}
        handleSubmit={handleSubmit}
        errors={fieldErrors}
        loading={loading}
        emailSent={success}
      />
    </AuthLayout>
  );
};

export default ForgotPassword;

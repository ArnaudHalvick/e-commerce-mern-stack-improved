import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useError } from "../../context/ErrorContext";

// Hooks
import { useProfileForm, usePasswordForm, useAccountManagement } from "./hooks";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import {
  BasicInfoSection,
  ShippingAddressSection,
  PasswordManager,
  AccountManager,
  EmailManager,
  EmailVerification,
} from "./components";
import Spinner from "../../components/ui/spinner";

// CSS
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();

  // Get user state from Redux
  const {
    user,
    loading,
    isAuthenticated,
    verificationRequested,
    passwordChanged,
    loadingStates,
  } = useSelector((state) => state.user);

  // Custom hooks for profile functionality
  const {
    formData,
    fieldErrors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  } = useProfileForm(user, showSuccess, showError);

  const {
    passwordData,
    isChangingPassword,
    passwordErrors,
    isSubmittingPassword,
    handlePasswordInputChange,
    handlePasswordSubmit,
    togglePasswordChange,
  } = usePasswordForm(passwordChanged, showSuccess, showError);

  const { isDisablingAccount, handleDisableAccount, handleResendVerification } =
    useAccountManagement(user, verificationRequested, showSuccess, showError);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Loading state check
  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="loading-container">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <Breadcrumb
        links={[
          { label: "Home", path: "/" },
          { label: "Profile", path: "/profile" },
        ]}
      />

      <h1 className="profile-title">Profile</h1>

      <div className="profile-container">
        <div className="profile-sections">
          {/* Basic Information Section */}
          <BasicInfoSection
            formData={formData}
            fieldErrors={fieldErrors}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting || loadingStates?.updateProfile}
          />

          {/* Shipping Address Section */}
          <ShippingAddressSection
            formData={formData}
            fieldErrors={fieldErrors}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting || loadingStates?.updateProfile}
          />

          {/* Email Manager */}
          <EmailManager
            user={user}
            handleResendVerification={handleResendVerification}
            isVerificationSending={loadingStates?.requestEmailVerification}
          />

          {/* Email Verification Status */}
          <EmailVerification
            user={user}
            verificationRequested={verificationRequested}
          />

          {/* Password Manager */}
          <PasswordManager
            passwordData={passwordData}
            passwordErrors={passwordErrors}
            isChangingPassword={isChangingPassword}
            handlePasswordInputChange={handlePasswordInputChange}
            handlePasswordSubmit={handlePasswordSubmit}
            togglePasswordChange={togglePasswordChange}
            isSubmittingPassword={
              isSubmittingPassword || loadingStates?.changePassword
            }
          />

          {/* Account Manager (Disable Account) */}
          <AccountManager
            handleDisableAccount={handleDisableAccount}
            isDisablingAccount={
              isDisablingAccount || loadingStates?.disableAccount
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;

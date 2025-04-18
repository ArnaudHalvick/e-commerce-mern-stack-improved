import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useErrorRedux from "../../hooks/useErrorRedux";

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
import "./styles/index.css";

const Profile = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useErrorRedux();

  // Memoize selector to prevent unnecessary re-renders
  const userState = useSelector(
    (state) => ({
      user: state.user.user,
      loading: state.user.loading,
      isAuthenticated: state.user.isAuthenticated,
      verificationRequested: state.user.verificationRequested,
      passwordChanged: state.user.passwordChanged,
      loadingStates: state.user.loadingStates,
    }),
    // Custom equality function to prevent unnecessary updates
    (prev, next) => {
      return (
        prev.user?.id === next.user?.id &&
        prev.loading === next.loading &&
        prev.isAuthenticated === next.isAuthenticated &&
        prev.verificationRequested === next.verificationRequested &&
        prev.passwordChanged === next.passwordChanged &&
        JSON.stringify(prev.loadingStates) ===
          JSON.stringify(next.loadingStates)
      );
    }
  );

  const {
    user,
    loading,
    isAuthenticated,
    verificationRequested,
    passwordChanged,
    loadingStates,
  } = userState;

  // Custom hooks for profile functionality - memoize initial data
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

  // Memoize navigation effect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Memoize breadcrumb links
  const breadcrumbRoutes = useMemo(
    () => [{ label: "Home", path: "/" }, { label: "Profile" }],
    []
  );

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
      <Breadcrumb routes={breadcrumbRoutes} />

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

export default React.memo(Profile);

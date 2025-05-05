import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useErrorRedux from "../../hooks/useErrorRedux";

// Redux actions
import { fetchUserProfile } from "../../redux/slices/userSlice";

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
  const dispatch = useDispatch();
  const { showError, showSuccess } = useErrorRedux();

  // Simplified selector with just what we need
  const {
    user,
    loading,
    isAuthenticated,
    verificationRequested,
    passwordChanged,
    loadingStates,
  } = useSelector((state) => ({
    user: state.user.user,
    loading: state.user.loading || state.user.loadingStates.fetchingProfile,
    isAuthenticated: state.user.isAuthenticated,
    verificationRequested: state.user.verificationRequested,
    passwordChanged: state.user.passwordChanged,
    loadingStates: state.user.loadingStates,
  }));

  // Fetch the full profile when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // Simple breadcrumb definition
  const breadcrumbRoutes = [{ label: "Home", path: "/" }, { label: "Profile" }];

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
    <>
      <Breadcrumb routes={breadcrumbRoutes} />
      <div className="profile-page-container">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-container">
          <div className="profile-sections">
            {/* Email Manager */}
            <EmailManager
              user={user}
              handleResendVerification={handleResendVerification}
              isVerificationSending={loadingStates?.sendingVerification}
            />

            {/* Email Verification Status */}
            <EmailVerification
              user={user}
              verificationRequested={verificationRequested}
            />

            {/* Basic Information Section */}
            <BasicInfoSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || loadingStates?.updatingProfile}
            />

            {/* Shipping Address Section */}
            <ShippingAddressSection
              formData={formData}
              fieldErrors={fieldErrors}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || loadingStates?.updatingProfile}
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
    </>
  );
};

export default Profile;

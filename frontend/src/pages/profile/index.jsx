import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  updateUserProfile,
  requestEmailVerification,
  changePassword,
  disableAccount,
} from "../../redux/slices/userSlice";
import { useError } from "../../context/ErrorContext";

// Custom hooks
import useSchemaValidation from "../../hooks/useSchemaValidation";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProfileInfo from "./components/ProfileInfo";
import PasswordManager from "./components/PasswordManager";
import AccountManager from "./components/AccountManager";
import EmailManager from "./components/EmailManager";
import EmailVerification from "./components/EmailVerification";
import Spinner from "../../components/ui/Spinner";

// CSS
import "./Profile.css";

/**
 * User profile page component
 */
const Profile = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    fetchUserProfile,
  } = useContext(AuthContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();
  const { loading, passwordChanged, passwordChangePending, loadingStates } =
    useSelector((state) => state.user);

  // Get validation rules from backend using our hooks
  const profileValidation = useSchemaValidation("profile");
  const passwordValidation = useSchemaValidation("password");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch complete profile when component mounts
  useEffect(() => {
    let isMounted = true;

    const getCompleteProfile = async () => {
      if (isAuthenticated && isMounted) {
        await fetchUserProfile();
      }
    };

    // Call function
    getCompleteProfile();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchUserProfile]);

  // Initialize form data with user profile data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]); // Only depend on user, not isEditing

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Reset form and show success message when password is changed
  useEffect(() => {
    if (passwordChanged) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);

      // Show success toast
      showSuccess("Password changed successfully!");
    }
  }, [passwordChanged, showSuccess]);

  // Add a useEffect to check for query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenExpired = queryParams.get("tokenExpired");

    if (tokenExpired === "true") {
      showError(
        "Your password change request has expired. Please request a new password change."
      );

      // Remove the query parameter from the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [showError]);

  // Update the handleInputChange function to validate as user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields (address.street, address.city, etc.)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });

      // Validate nested field using our hook
      const fullFieldName = `${parent}.${child}`;
      const error = profileValidation.validateField(fullFieldName, value);
      updateFieldError(parent, child, error);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Validate regular field using our hook
      const error = profileValidation.validateField(name, value);
      updateFieldError(name, null, error);
    }
  };

  // Helper to update field errors state
  const updateFieldError = (fieldName, childName, errorMessage) => {
    if (childName) {
      // For nested fields
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          [childName]: errorMessage,
        },
      }));
    } else {
      // For regular fields
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password field on change
    if (passwordValidation.schema) {
      const error = passwordValidation.validateField(name, value);
      if (error) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  // Validate form before submission
  const validateForm = (data) => {
    // Use the hook's validateForm method
    if (profileValidation.schema) {
      const errors = profileValidation.validateForm(data);
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        setFieldErrors(errors);
        return false;
      }
      return true;
    }

    // If we don't have validation schema yet, allow submission
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e, customFormData = null) => {
    e?.preventDefault();

    // Use custom form data if provided, otherwise use the form state
    const dataToSubmit = customFormData || formData;

    // Validate the form
    if (!validateForm(dataToSubmit)) {
      showError("Please fix the validation errors before submitting");
      return;
    }

    try {
      const result = await dispatch(updateUserProfile(dataToSubmit)).unwrap();
      showSuccess("Profile updated successfully!");

      // Update the displayed user data
      setUpdatedUserData({
        ...user,
        ...dataToSubmit,
      });
    } catch (error) {
      showError(error || "Failed to update profile");
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setFieldErrors({});

    // Validate password fields with schema
    if (passwordValidation.schema) {
      const errors = {};

      // Use the hook's validateForm method
      const validationErrors = passwordValidation.validateForm(passwordData);

      // If we have validation errors, show them and stop
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        showError("Please fix the validation errors before submitting");
        return;
      }
    }

    try {
      // Send all required fields to the API, including confirmPassword
      const passwordPayload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword, // Include this for the API
      };

      const result = await dispatch(changePassword(passwordPayload)).unwrap();
      // Success is handled by useEffect watching for passwordChanged
    } catch (error) {
      // Handle structured validation errors from the backend
      if (error.validationErrors) {
        setFieldErrors(error.validationErrors);
      } else if (
        typeof error === "string" &&
        error.includes("current password")
      ) {
        // Handle specific error message about incorrect current password
        setFieldErrors({
          currentPassword: "Current password is incorrect",
        });
      } else {
        // Show generic error message
        showError(
          typeof error === "string" ? error : "Failed to change password"
        );
      }
    }
  };

  // Handle Account Management
  const handleLogout = useCallback(async () => {
    try {
      // Cancel any pending API requests before logging out
      if (typeof window !== "undefined") {
        const event = new CustomEvent("user:logout");
        window.dispatchEvent(event);
      }

      // Clear field errors and other local state
      setFieldErrors({});

      // Perform logout
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still clear local state
      setFieldErrors({});
      logout();
      navigate("/");
    }
  }, [logout, navigate]);

  const handleDisableAccount = async () => {
    try {
      await dispatch(disableAccount()).unwrap();

      showSuccess(
        "Your account has been disabled. You will be logged out in a moment."
      );

      // Log out after a brief delay to allow the user to see the success message
      setTimeout(() => {
        handleLogout();
      }, 3000);
    } catch (error) {
      showError(error || "Failed to disable account");
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setVerificationRequested(true);
      showSuccess("Verification email sent. Please check your inbox.");
    } catch (error) {
      showError(error || "Failed to send verification email");
    }
  };

  // Show either the fetched user data or the updated one
  const displayUserData = updatedUserData || user;
  const displayName =
    displayUserData?.username || displayUserData?.name || "User";

  return (
    <div className="profile-container">
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Profile" }]}
      />

      <h1 className="profile-heading">Profile</h1>

      {/* Show loading state */}
      {authLoading ? (
        <div className="profile-loading">
          <Spinner size="large" message="Loading your profile..." />
        </div>
      ) : (
        <>
          {/* Email Verification Alert - if user's email is not verified */}
          <EmailVerification
            user={user}
            verificationRequested={verificationRequested}
            handleResendVerification={handleResendVerification}
            loading={loading}
            sendingVerification={loadingStates?.sendingVerification}
          />

          {/* Email Management */}
          <EmailManager
            user={displayUserData}
            validationSchema={profileValidation.schema}
            showSuccess={showSuccess}
            showError={showError}
          />

          {/* Profile Info (Basic Information and Address) */}
          <ProfileInfo
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            updatingProfile={loadingStates?.updatingProfile}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            displayUserData={displayUserData}
            displayName={displayName}
            validationSchema={profileValidation.schema}
          />

          {/* Password Management */}
          <PasswordManager
            passwordData={passwordData}
            handlePasswordInputChange={handlePasswordInputChange}
            handlePasswordSubmit={handlePasswordSubmit}
            fieldErrors={fieldErrors}
            isChangingPassword={isChangingPassword}
            setIsChangingPassword={setIsChangingPassword}
            loading={loading}
            changingPassword={loadingStates?.changingPassword}
            validationSchema={passwordValidation.schema}
          />

          {/* Account Management (Disable Account) */}
          <AccountManager
            handleDisableAccount={handleDisableAccount}
            disablingAccount={loadingStates?.disablingAccount}
          />
        </>
      )}
    </div>
  );
};

export default Profile;

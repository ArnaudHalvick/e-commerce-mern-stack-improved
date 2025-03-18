import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  updateUserProfile,
  requestEmailVerification,
  changePassword,
  disableAccount,
  resetPasswordChanged,
} from "../../redux/slices/userSlice";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProfileInfo from "./components/ProfileInfo";
import PasswordManager from "./components/PasswordManager";
import AccountManager from "./components/AccountManager";
import EmailVerification from "./components/EmailVerification";

// Hooks
import useProfileValidation from "./hooks/useProfileValidation";

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
  const { loading, error, passwordChanged } = useSelector(
    (state) => state.user
  );

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

  const [message, setMessage] = useState({ text: "", type: "" });
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);

  // Use custom validation hook
  const {
    fieldErrors,
    setFieldErrors,
    validateAddressFields,
    validatePasswordChange,
    clearFieldError,
    resetFieldErrors,
  } = useProfileValidation();

  // Fetch complete profile when component mounts
  useEffect(() => {
    const getCompleteProfile = async () => {
      if (isAuthenticated) {
        await fetchUserProfile();
      }
    };

    getCompleteProfile();
  }, [isAuthenticated, fetchUserProfile]);

  // Initialize form data with user profile data
  useEffect(() => {
    if (user && !isEditing) {
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
  }, [user, isEditing]);

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
      setMessage({
        text: "Password changed successfully!",
        type: "success",
      });
      dispatch(resetPasswordChanged());
    }
  }, [passwordChanged, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));

      // Clear error for this field
      clearFieldError(addressField);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field
      clearFieldError(name);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Validate all address fields
    if (!validateAddressFields(formData)) {
      setMessage({
        text: "Please fix the errors in the form",
        type: "error",
      });
      return;
    }

    try {
      const response = await dispatch(updateUserProfile(formData)).unwrap();
      // Store the updated user data
      setUpdatedUserData(response);

      // Also refresh the user data in the AuthContext
      await fetchUserProfile();

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
      setIsEditing(false);
    } catch (err) {
      setMessage({
        text: err || "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Validate passwords
    const validation = validatePasswordChange(passwordData);
    if (!validation.isValid) {
      setMessage({
        text: validation.message,
        type: "error",
      });
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      // Success message and reset will be handled by the useEffect
    } catch (err) {
      setMessage({
        text: err || "Failed to change password. Please try again.",
        type: "error",
      });
    }
  };

  const handleDisableAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to disable your account? You won't be able to log in until an administrator re-enables it."
      )
    ) {
      try {
        await dispatch(disableAccount()).unwrap();
        logout();
        navigate("/");
      } catch (err) {
        setMessage({
          text: err || "Failed to disable account. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setVerificationRequested(true);
      setMessage({
        text: "Verification email has been sent!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err || "Failed to send verification email. Please try again.",
        type: "error",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="profile-container">
        <Breadcrumb
          routes={[{ label: "HOME", path: "/" }, { label: "PROFILE" }]}
        />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Get the display user data (either the updated data or the original user data)
  const displayUserData = updatedUserData || user;
  const displayName =
    displayUserData?.username || displayUserData?.name || "Not provided";

  return (
    <div className="profile-container">
      <Breadcrumb current="My Profile" />

      <div className="profile-content">
        <h1 className="profile-title">My Profile</h1>

        {/* Display Messages */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* Email Verification Alert */}
        <EmailVerification
          user={user}
          verificationRequested={verificationRequested}
          handleResendVerification={handleResendVerification}
          loading={loading}
        />

        <div className="profile-sections">
          {/* Basic Info Section */}
          <ProfileInfo
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            displayUserData={displayUserData}
            displayName={displayName}
          />

          <div>
            {/* Password Management Section */}
            <PasswordManager
              isChangingPassword={isChangingPassword}
              setIsChangingPassword={setIsChangingPassword}
              passwordData={passwordData}
              handlePasswordInputChange={handlePasswordInputChange}
              handlePasswordSubmit={handlePasswordSubmit}
              loading={loading}
            />

            {/* Account Management Section */}
            <AccountManager
              handleDisableAccount={handleDisableAccount}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

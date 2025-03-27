import React, { useEffect, useState, useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const { loading, passwordChanged, loadingStates } = useSelector(
    (state) => state.user
  );

  // Get validation rules from backend
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

  // Fetch complete profile on mount
  useEffect(() => {
    let isMounted = true;
    const getCompleteProfile = async () => {
      if (isAuthenticated && isMounted) {
        await fetchUserProfile();
      }
    };
    getCompleteProfile();
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
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Reset form and show success when password is changed
  useEffect(() => {
    if (passwordChanged) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      showSuccess("Password changed successfully!");
    }
  }, [passwordChanged, showSuccess]);

  // Check for query parameters (e.g., tokenExpired)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenExpired = queryParams.get("tokenExpired");
    if (tokenExpired === "true") {
      showError(
        "Your password change request has expired. Please request a new password change."
      );
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
      const fullFieldName = `${parent}.${child}`;
      const error = profileValidation.validateField(fullFieldName, value);
      updateFieldError(parent, child, error);
    } else {
      setFormData({ ...formData, [name]: value });
      const error = profileValidation.validateField(name, value);
      updateFieldError(name, null, error);
      if (name === "name" && value.trim().length === 1) {
        updateFieldError(name, null, "Name must be at least 2 characters long");
      }
    }
  };

  const updateFieldError = (fieldName, childName, errorMessage) => {
    if (childName) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          [childName]: errorMessage,
        },
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordValidation.schema) {
      const error = passwordValidation.validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error || null,
      }));
    }
  };

  const validateForm = (data) => {
    if (profileValidation.schema) {
      // Handle nested fields like address properly
      const flattenedData = { ...data };

      // Process address fields separately
      const hasAddressData =
        data.address &&
        Object.values(data.address).some(
          (value) => value && typeof value === "string" && value.trim() !== ""
        );

      // Only validate address if it contains data
      if (hasAddressData) {
        Object.keys(data.address).forEach((key) => {
          flattenedData[`address.${key}`] = data.address[key];
        });
      }

      const validationErrors = {};

      // Validate fields other than address first
      Object.keys(flattenedData).forEach((key) => {
        // Skip address fields for now
        if (key.startsWith("address.")) return;

        // Phone is optional, so skip if empty
        if (
          key === "phone" &&
          (!flattenedData[key] || flattenedData[key].trim() === "")
        ) {
          return;
        }

        const error = profileValidation.validateField(key, flattenedData[key]);
        if (error) {
          validationErrors[key] = error;
        }
      });

      // Validate address fields separately if needed
      if (hasAddressData) {
        // Required address fields if any address data is provided
        const requiredAddressFields = ["street", "city", "zipCode", "country"];

        // Check if all required fields are present
        let missingRequiredField = false;
        requiredAddressFields.forEach((field) => {
          const fieldName = `address.${field}`;
          const value = flattenedData[fieldName];

          if (!value || value.trim() === "") {
            missingRequiredField = true;
            validationErrors[fieldName] = `${
              field.charAt(0).toUpperCase() + field.slice(1)
            } is required`;
          } else {
            // Validate the field according to schema
            const error = profileValidation.validateField(fieldName, value);
            if (error) {
              validationErrors[fieldName] = error;
            }
          }
        });
      }

      // Format errors with better field names
      const formattedErrors = {};

      Object.keys(validationErrors).forEach((key) => {
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          if (!formattedErrors[parent]) {
            formattedErrors[parent] = {};
          }
          // Use a more user-friendly error message by capitalizing first letter
          const displayName = child.charAt(0).toUpperCase() + child.slice(1);
          const errorMsg = validationErrors[key].replace(
            `${key} `,
            `${displayName} `
          );
          formattedErrors[parent][child] = errorMsg;
        } else {
          // Also format non-nested fields
          const displayName = key.charAt(0).toUpperCase() + key.slice(1);
          const errorMsg = validationErrors[key].replace(
            `${key} `,
            `${displayName} `
          );
          formattedErrors[key] = errorMsg;
        }
      });

      if (Object.keys(formattedErrors).length > 0) {
        setFieldErrors(formattedErrors);
        return false;
      }
      return true;
    }
    return true;
  };

  const handleSubmit = async (e, customFormData = null) => {
    e?.preventDefault();
    const dataToSubmit = customFormData || formData;

    // Special handling for address updates
    const isAddressUpdate =
      dataToSubmit.address &&
      Object.values(dataToSubmit.address).some((val) => val !== "");

    if (!validateForm(dataToSubmit)) {
      showError("Please fix the validation errors before submitting");
      return;
    }

    try {
      // Ensure address fields are properly formatted for the backend
      let formattedData = { ...dataToSubmit };

      // If we're updating an address, ensure all fields are properly formatted
      if (isAddressUpdate) {
        // Ensure all address fields are present, even if empty
        formattedData.address = {
          street: dataToSubmit.address.street || "",
          city: dataToSubmit.address.city || "",
          state: dataToSubmit.address.state || "",
          zipCode: dataToSubmit.address.zipCode || "",
          country: dataToSubmit.address.country || "",
        };

        console.log(
          "Formatted address data:",
          JSON.stringify(formattedData, null, 2)
        );
      }

      // Call updateUserProfile action and wait for the response
      const updatedUser = await dispatch(
        updateUserProfile(formattedData)
      ).unwrap();

      // Only show success and update data if we get a successful response
      if (updatedUser) {
        showSuccess("Profile updated successfully!");

        // For address updates, verify the address was actually saved
        if (isAddressUpdate) {
          const addressSaved =
            updatedUser.address &&
            Object.keys(formattedData.address).every(
              (key) => updatedUser.address[key] === formattedData.address[key]
            );

          if (!addressSaved) {
            showError(
              "Address may not have been saved correctly. Please verify your information."
            );
            console.error("Address update mismatch - sent vs received:", {
              sent: formattedData.address,
              received: updatedUser.address,
            });
          }
        }

        // Merge the updated user data with existing user data
        const updatedData = {
          ...user,
          ...updatedUser,
          name: updatedUser.name || user.name,
          username: updatedUser.name || user.username,
          address: updatedUser.address || user.address,
          phone: updatedUser.phone || user.phone,
        };

        // Update local state
        setUpdatedUserData(updatedData);

        // Refresh the complete profile to ensure data is in sync with backend
        await fetchUserProfile();
      } else {
        showError("Failed to update profile - no response from server");
      }
    } catch (error) {
      // Handle different types of errors
      if (error.validationErrors) {
        // Format validation errors for display
        const errorMessage = Object.values(error.validationErrors).join(". ");
        showError(errorMessage || "Validation error in profile update");
      } else if (typeof error === "string") {
        showError(error);
      } else {
        showError(error.message || "Failed to update profile");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (passwordValidation.schema) {
      const validationErrors = passwordValidation.validateForm(passwordData);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        showError("Please fix the validation errors before submitting");
        return;
      }
    }
    try {
      const passwordPayload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };
      await dispatch(changePassword(passwordPayload)).unwrap();
    } catch (error) {
      if (error.validationErrors) {
        setFieldErrors(error.validationErrors);
      } else if (
        typeof error === "string" &&
        error.includes("current password")
      ) {
        setFieldErrors({ currentPassword: "Current password is incorrect" });
      } else {
        showError(
          typeof error === "string" ? error : "Failed to change password"
        );
      }
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        const event = new CustomEvent("user:logout");
        window.dispatchEvent(event);
      }
      setFieldErrors({});
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setFieldErrors({});
      logout();
      navigate("/");
    }
  }, [logout, navigate]);

  const handleDisableAccount = async (password) => {
    try {
      await dispatch(disableAccount(password)).unwrap();
      showSuccess(
        "Your account has been disabled. You will be logged out now."
      );
      handleLogout();
    } catch (error) {
      showError(error || "Failed to disable account");
      throw error; // Re-throw to allow modal to handle specific errors
    }
  };

  const handleResendVerification = async () => {
    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setVerificationRequested(true);
      showSuccess("Verification email sent. Please check your inbox.");
    } catch (error) {
      showError(error || "Failed to send verification email");
    }
  };

  const displayUserData = updatedUserData || user;
  const displayName =
    displayUserData?.name || displayUserData?.username || "User";

  useEffect(() => {
    if (updatedUserData?.name) {
      setFormData((prev) => ({ ...prev, name: updatedUserData.name }));
    }
  }, [updatedUserData]);

  return (
    <div className="profile-container">
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Profile" }]}
      />
      <h1 className="profile-heading">Profile</h1>
      {authLoading ? (
        <div className="profile-loading">
          <Spinner size="large" message="Loading your profile..." />
        </div>
      ) : (
        <>
          <EmailVerification
            user={user}
            verificationRequested={verificationRequested}
            handleResendVerification={handleResendVerification}
            loading={loading}
            sendingVerification={loadingStates?.sendingVerification}
          />
          <EmailManager
            user={displayUserData}
            validationSchema={profileValidation.schema}
            showSuccess={showSuccess}
            showError={showError}
          />
          <ProfileInfo
            formData={formData}
            setFormData={setFormData}
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

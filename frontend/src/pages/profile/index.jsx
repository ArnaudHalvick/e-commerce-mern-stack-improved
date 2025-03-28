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

// Import the validation functions
import { validatePasswordMatch, validateForm } from "../../utils/validation";

// Import the schemas
import {
  profileBasicInfoSchema,
  profileAddressSchema,
  profilePasswordChangeSchema,
} from "../../utils/validationSchemas";

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

  // Initial validation after form data is populated
  useEffect(() => {
    if (formData.name) {
      // Validate basic info using the imported schema
      const basicInfoErrors = validateForm(formData, profileBasicInfoSchema);

      // Validate address fields if any are filled
      const hasAddressData = Object.values(formData.address).some(
        (val) => val && val.trim() !== ""
      );

      if (hasAddressData) {
        const addressErrors = validateForm(
          { address: formData.address },
          profileAddressSchema
        );

        // Update field errors state
        setFieldErrors((prev) => ({
          ...prev,
          ...basicInfoErrors,
          ...addressErrors,
        }));
      } else {
        setFieldErrors(basicInfoErrors);
      }
    }
  }, [formData]); // Updated dependency array to include the entire formData

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

      // Validate address fields using schema
      if (parent === "address") {
        const updatedAddress = {
          ...formData.address,
          [child]: value,
        };

        const addressErrors = validateForm(
          { address: updatedAddress },
          profileAddressSchema
        );

        setFieldErrors((prev) => ({
          ...prev,
          ...addressErrors,
        }));
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Validate basic info fields using schema
      const fieldToValidate = { [name]: value };
      const errors = validateForm(fieldToValidate, {
        [name]: profileBasicInfoSchema[name],
      });

      setFieldErrors((prev) => ({
        ...prev,
        ...errors,
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Use profile password change schema for validation
    const updatedPasswordData = {
      ...passwordData,
      [name]: value,
    };

    // Validate password fields
    const errors = validateForm(
      updatedPasswordData,
      profilePasswordChangeSchema
    );

    // Special handling for confirmPassword - validate matching
    if (name === "confirmPassword" || name === "newPassword") {
      const matchResult = validatePasswordMatch(
        name === "newPassword" ? value : passwordData.newPassword,
        name === "confirmPassword" ? value : passwordData.confirmPassword
      );

      if (!matchResult.isValid) {
        errors.confirmPassword = matchResult.message;
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      ...errors,
    }));
  };

  const runValidation = (data) => {
    // Define which schema to use based on the data
    let validationSchema = profileBasicInfoSchema;
    if (data.address && Object.values(data.address).some((val) => val !== "")) {
      validationSchema = {
        ...profileBasicInfoSchema,
        ...profileAddressSchema,
      };
    }

    // Validate the form data
    const errors = validateForm(data, validationSchema);

    // If there are errors, update the field errors state
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
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

    if (!runValidation(dataToSubmit)) {
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

    // Validate password using schema
    const errors = validateForm(passwordData, profilePasswordChangeSchema);

    // Add confirm password validation
    const matchResult = validatePasswordMatch(
      passwordData.newPassword,
      passwordData.confirmPassword
    );

    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.message;
    }

    // Update field errors and return if validation fails
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        ...errors,
      }));
      return;
    }

    // Proceed with password change if validation passes
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
            validationSchema={profileBasicInfoSchema}
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
            validationSchema={profilePasswordChangeSchema}
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

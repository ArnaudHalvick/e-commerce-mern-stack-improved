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
  resetPasswordChanged,
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
import { apiClient } from "../../services";

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

  const [message, setMessage] = useState({ text: "", type: "" });
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
  const [validationSchema, setValidationSchema] = useState(null);

  // Fetch complete profile when component mounts
  useEffect(() => {
    let isMounted = true;

    const getCompleteProfile = async () => {
      if (isAuthenticated && isMounted) {
        await fetchUserProfile();
      }
    };

    // Fetch validation schema from backend
    const fetchValidationSchema = async () => {
      try {
        if (!isMounted) return;
        const response = await apiClient.get("/api/validation/profile");
        if (isMounted) {
          setValidationSchema(response.data);
        }
      } catch (error) {
        if (isMounted && !error.isLoggedOut) {
          showError("Failed to load validation rules");
        }
      }
    };

    // Call both functions
    fetchValidationSchema();
    getCompleteProfile();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchUserProfile, showError]);

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

      setMessage({
        text: "Password changed successfully!",
        type: "success",
      });

      // Clear the success message after 5 seconds
      const timerId = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);

      // Clean up timer on unmount
      return () => clearTimeout(timerId);

      dispatch(resetPasswordChanged());
    }
  }, [passwordChanged, dispatch]);

  // Add a useEffect to check for query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenExpired = queryParams.get("tokenExpired");

    if (tokenExpired === "true") {
      setMessage({
        text: "Your password change request has expired. Please request a new password change.",
        type: "error",
      });

      // Remove the query parameter from the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

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

      // Validate nested field
      validateField(parent, child, value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Validate regular field
      validateField(name, null, value);
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

  // Add this function for field-level validation
  const validateField = (fieldName, childName = null, value) => {
    // Skip validation if we don't have validation rules
    if (!validationSchema) return;

    let fieldRules = validationSchema[fieldName];
    let fieldValue = value;
    let errorMessage = null;

    // Handle nested field validation
    if (childName && fieldRules) {
      fieldRules = fieldRules[childName];

      // Initialize nested errors object if needed
      if (!fieldErrors[fieldName]) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: {},
        }));
      }
    }

    // Skip if no validation rules for this field
    if (!fieldRules) return;

    // Check required fields
    if (fieldRules.required && (!fieldValue || fieldValue.trim() === "")) {
      errorMessage = fieldRules.requiredMessage || `${fieldName} is required`;
    }
    // Check minimum length
    else if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
      errorMessage =
        fieldRules.message ||
        `${fieldName} must be at least ${fieldRules.minLength} characters`;
    }
    // Check maximum length
    else if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
      errorMessage =
        fieldRules.message ||
        `${fieldName} cannot exceed ${fieldRules.maxLength} characters`;
    }
    // Check pattern
    else if (fieldRules.pattern) {
      const pattern = new RegExp(fieldRules.pattern);
      if (!pattern.test(fieldValue)) {
        errorMessage = fieldRules.message || `Invalid ${fieldName} format`;
      }
    }

    // Update error state
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

  // Validate form before submission
  const validateForm = (data) => {
    // Skip validation if we don't have validation rules
    if (!validationSchema) return true;

    let isValid = true;
    const errors = {};

    // Process each field in the form data
    Object.entries(data).forEach(([fieldName, fieldValue]) => {
      // Skip validation for the address object - we'll do that separately
      if (fieldName === "address") return;

      const fieldRules = validationSchema[fieldName];
      if (!fieldRules) return;

      // Check required fields
      if (
        fieldRules.required &&
        (!fieldValue || fieldValue.toString().trim() === "")
      ) {
        errors[fieldName] =
          fieldRules.requiredMessage || `${fieldName} is required`;
        isValid = false;
      }
      // Check minimum length
      else if (
        fieldRules.minLength &&
        fieldValue.length < fieldRules.minLength
      ) {
        errors[fieldName] =
          fieldRules.message ||
          `${fieldName} must be at least ${fieldRules.minLength} characters`;
        isValid = false;
      }
      // Check maximum length
      else if (
        fieldRules.maxLength &&
        fieldValue.length > fieldRules.maxLength
      ) {
        errors[fieldName] =
          fieldRules.message ||
          `${fieldName} cannot exceed ${fieldRules.maxLength} characters`;
        isValid = false;
      }
      // Check pattern
      else if (fieldRules.pattern) {
        const pattern = new RegExp(fieldRules.pattern);
        if (fieldValue && !pattern.test(fieldValue)) {
          errors[fieldName] =
            fieldRules.message || `Invalid ${fieldName} format`;
          isValid = false;
        }
      }
    });

    // Validate address fields if present
    if (data.address && validationSchema.address) {
      errors.address = {};
      let addressValid = true;

      Object.entries(data.address).forEach(([addressField, addressValue]) => {
        const addressRules = validationSchema.address[addressField];
        if (!addressRules) return;

        // Validate each address field
        if (
          addressRules.required &&
          (!addressValue || addressValue.trim() === "")
        ) {
          errors.address[addressField] =
            addressRules.requiredMessage || `${addressField} is required`;
          addressValid = false;
        } else if (
          addressRules.minLength &&
          addressValue.length < addressRules.minLength
        ) {
          errors.address[addressField] =
            addressRules.message ||
            `${addressField} must be at least ${addressRules.minLength} characters`;
          addressValid = false;
        } else if (
          addressRules.maxLength &&
          addressValue.length > addressRules.maxLength
        ) {
          errors.address[addressField] =
            addressRules.message ||
            `${addressField} cannot exceed ${addressRules.maxLength} characters`;
          addressValid = false;
        } else if (addressRules.pattern) {
          const pattern = new RegExp(addressRules.pattern);
          if (addressValue && !pattern.test(addressValue)) {
            errors.address[addressField] =
              addressRules.message || `Invalid ${addressField} format`;
            addressValid = false;
          }
        }
      });

      // If all address fields are valid, remove the address errors object
      if (addressValid) {
        delete errors.address;
      } else {
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e, customFormData = null) => {
    e?.preventDefault();

    // Use custom form data if provided, otherwise use the form state
    const dataToSubmit = customFormData || formData;

    // Validate the form
    if (!validateForm(dataToSubmit)) {
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

      // Validate each field individually
      Object.keys(passwordData).forEach((field) => {
        const error = passwordValidation.validateField(
          field,
          passwordData[field]
        );
        if (error) errors[field] = error;
      });

      // Special validation for confirmPassword
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      // If we have validation errors, show them and stop
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
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
      await logout();
      navigate("/");
    } catch (error) {
      // Even if there's an error, still clear local state
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
        <Spinner size="large" message="Loading your profile..." />
      ) : (
        <>
          {/* Status Messages */}
          {message.text && (
            <div className={`profile-form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Verification Status Messages */}
          {emailVerificationStatus && (
            <div
              className={`profile-form-message ${emailVerificationStatus.type}`}
            >
              {emailVerificationStatus.message}
            </div>
          )}

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
            validationSchema={validationSchema}
            setEmailVerificationStatus={setEmailVerificationStatus}
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
            validationSchema={validationSchema}
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
            changingPassword={loadingStates.changingPassword}
            validationSchema={passwordValidation.schema}
          />

          {/* Account Management (Disable Account) */}
          <AccountManager handleDisableAccount={handleDisableAccount} />
        </>
      )}
    </div>
  );
};

export default Profile;

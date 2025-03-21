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
  requestEmailChange,
} from "../../redux/slices/userSlice";
import { useError } from "../../context/ErrorContext";

// Custom hooks
import useSchemaValidation from "../../hooks/useSchemaValidation";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProfileInfo from "./components/ProfileInfo";
import PasswordManager from "./components/PasswordManager";
import AccountManager from "./components/AccountManager";
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
    const getCompleteProfile = async () => {
      if (isAuthenticated) {
        await fetchUserProfile();
      }
    };

    // Fetch validation schema from backend
    const fetchValidationSchema = async () => {
      try {
        const response = await apiClient.get("/api/validation/profile");
        setValidationSchema(response.data);
      } catch (error) {
        showError("Failed to load validation rules");
      }
    };

    // Call both functions
    fetchValidationSchema();
    getCompleteProfile();
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

      if (passwordChangePending) {
        setMessage({
          text: "Verification email sent. Please check your email to confirm password change.",
          type: "success",
        });
      } else {
        setMessage({
          text: "Password changed successfully!",
          type: "success",
        });
      }

      dispatch(resetPasswordChanged());
    }
  }, [passwordChanged, passwordChangePending, dispatch]);

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
    else if (
      fieldRules.minLength &&
      fieldValue &&
      fieldValue.length < fieldRules.minLength
    ) {
      errorMessage =
        fieldRules.message ||
        `Minimum length is ${fieldRules.minLength} characters`;
    }
    // Check maximum length
    else if (
      fieldRules.maxLength &&
      fieldValue &&
      fieldValue.length > fieldRules.maxLength
    ) {
      errorMessage =
        fieldRules.message ||
        `Maximum length is ${fieldRules.maxLength} characters`;
    }
    // Check pattern
    else if (fieldRules.pattern && fieldValue) {
      const pattern = new RegExp(fieldRules.pattern);
      if (!pattern.test(fieldValue)) {
        errorMessage = fieldRules.message || `Invalid format`;
      }
    }

    // Update field errors
    setFieldErrors((prev) => {
      if (childName) {
        // For nested fields
        return {
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            [childName]: errorMessage,
          },
        };
      } else {
        // For regular fields
        return {
          ...prev,
          [fieldName]: errorMessage,
        };
      }
    });
  };

  // Add this function to validate the full form before submission
  const validateForm = (data) => {
    const errors = {};
    let isValid = true;

    // Skip validation if we don't have validation rules
    if (!validationSchema) return { isValid: true, errors: {} };

    // Validate each field according to its rules
    Object.keys(data).forEach((field) => {
      if (field === "address" && data[field]) {
        // Handle address fields
        errors.address = {};
        Object.keys(data[field]).forEach((addressField) => {
          const addressFieldRules = validationSchema.address?.[addressField];
          if (addressFieldRules) {
            const value = data[field][addressField];
            let fieldError = null;

            // Check required fields
            if (addressFieldRules.required && (!value || value.trim() === "")) {
              fieldError =
                addressFieldRules.requiredMessage ||
                `${addressField} is required`;
            }
            // Check minimum length
            else if (
              addressFieldRules.minLength &&
              value &&
              value.length < addressFieldRules.minLength
            ) {
              fieldError =
                addressFieldRules.message ||
                `Minimum length is ${addressFieldRules.minLength} characters`;
            }
            // Check maximum length
            else if (
              addressFieldRules.maxLength &&
              value &&
              value.length > addressFieldRules.maxLength
            ) {
              fieldError =
                addressFieldRules.message ||
                `Maximum length is ${addressFieldRules.maxLength} characters`;
            }
            // Check pattern
            else if (addressFieldRules.pattern && value) {
              const pattern = new RegExp(addressFieldRules.pattern);
              if (!pattern.test(value)) {
                fieldError = addressFieldRules.message || `Invalid format`;
              }
            }

            if (fieldError) {
              errors.address[addressField] = fieldError;
              isValid = false;
            }
          }
        });

        // Remove address errors object if empty
        if (Object.keys(errors.address).length === 0) {
          delete errors.address;
        }
      } else {
        // Handle regular fields
        const fieldRules = validationSchema[field];
        if (fieldRules) {
          const value = data[field];
          let fieldError = null;

          // Check required fields
          if (fieldRules.required && (!value || value.trim() === "")) {
            fieldError = fieldRules.requiredMessage || `${field} is required`;
          }
          // Check minimum length
          else if (
            fieldRules.minLength &&
            value &&
            value.length < fieldRules.minLength
          ) {
            fieldError =
              fieldRules.message ||
              `Minimum length is ${fieldRules.minLength} characters`;
          }
          // Check maximum length
          else if (
            fieldRules.maxLength &&
            value &&
            value.length > fieldRules.maxLength
          ) {
            fieldError =
              fieldRules.message ||
              `Maximum length is ${fieldRules.maxLength} characters`;
          }
          // Check pattern
          else if (fieldRules.pattern && value) {
            const pattern = new RegExp(fieldRules.pattern);
            if (!pattern.test(value)) {
              fieldError = fieldRules.message || `Invalid format`;
            }
          }

          if (fieldError) {
            errors[field] = fieldError;
            isValid = false;
          }
        }
      }
    });

    return { isValid, errors };
  };

  // Update the handleSubmit function to use the new validation
  const handleSubmit = async (e, customFormData = null) => {
    e.preventDefault();

    const dataToSubmit = customFormData || formData;

    // Validate form before submission
    const { isValid, errors } = validateForm(dataToSubmit);

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await dispatch(updateUserProfile(dataToSubmit)).unwrap();

      // Store the updated user data
      setUpdatedUserData(response);

      // Also refresh the user data in the AuthContext
      await fetchUserProfile();

      // Update the form data with the latest response
      // Include only fields present in the response to avoid overwriting existing fields
      setFormData((prev) => {
        const newFormData = { ...prev };

        if (response.name) newFormData.name = response.name;
        if (response.phone !== undefined)
          newFormData.phone = response.phone || "";

        // Update address if it's in the response
        if (response.address) {
          newFormData.address = {
            street: response.address.street || "",
            city: response.address.city || "",
            state: response.address.state || "",
            zipCode: response.address.zipCode || "",
            country: response.address.country || "",
          };
        }

        return newFormData;
      });

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (err) {
      // Check for validation errors in the response
      if (err?.validationErrors) {
        const validationErrors = {};
        // Transform the backend validation errors to match our field structure
        Object.entries(err.validationErrors).forEach(([field, message]) => {
          // Convert fields like 'address.street' to 'street'
          const fieldName = field.includes(".") ? field.split(".")[1] : field;
          validationErrors[fieldName] = message;
        });
        setFieldErrors(validationErrors);
        setMessage({
          text: "Please fix the errors in the form",
          type: "error",
        });
      } else {
        setMessage({
          text: err || "Failed to update profile. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setFieldErrors({});

    // Client-side validation using schema validation
    if (passwordValidation.schema && !passwordValidation.isLoading) {
      const errors = passwordValidation.validateForm(passwordData);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setMessage({
          text: "Please fix the errors in the form",
          type: "error",
        });
        return;
      }
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
      // Check for validation errors in the response
      if (err?.validationErrors) {
        const validationErrors = {};
        Object.entries(err.validationErrors).forEach(([field, message]) => {
          validationErrors[field] = message;
        });
        setFieldErrors(validationErrors);
        setMessage({
          text: "Please fix the errors in the form",
          type: "error",
        });
      } else {
        setMessage({
          text: err || "Failed to change password. Please try again.",
          type: "error",
        });
      }
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

  // Handle email change request
  const handleEmailChangeRequest = async (newEmail) => {
    // Clear any previous message
    setMessage({ text: "", type: "" });
    setEmailVerificationStatus(null);

    // Validate that the email is different from current email
    if (user && user.email === newEmail) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "New email must be different from your current email",
      }));
      return;
    }

    try {
      // Dispatch the email change request
      const response = await dispatch(requestEmailChange(newEmail)).unwrap();

      // Set success message
      setEmailVerificationStatus({
        message: `Verification email sent to ${newEmail}. Please check your inbox to confirm this change.`,
        type: "success",
      });

      // Show toast notification
      showSuccess("Verification email sent successfully");
    } catch (error) {
      // Handle errors
      const errorMessage =
        error?.message || "Failed to request email verification";
      setEmailVerificationStatus({
        message: errorMessage,
        type: "error",
      });

      // Show error notification
      showError(errorMessage);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setVerificationRequested(true);
    } catch (err) {
      setMessage({
        text: err || "Failed to send verification email. Please try again.",
        type: "error",
      });
    }
  };

  if (authLoading || profileValidation.isLoading) {
    return (
      <div className="profile-container">
        <Breadcrumb
          routes={[{ label: "HOME", path: "/" }, { label: "PROFILE" }]}
        />
        <div className="loading">
          <Spinner message="Loading profile data..." size="medium" />
        </div>
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
          sendingVerification={loadingStates?.sendingVerification}
        />

        <div className="profile-sections">
          {/* Basic Info Section */}
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
            handleEmailChangeRequest={handleEmailChangeRequest}
            emailVerificationStatus={emailVerificationStatus}
          />

          {/* Password Management Section */}
          <PasswordManager
            isChangingPassword={isChangingPassword}
            setIsChangingPassword={setIsChangingPassword}
            passwordData={passwordData}
            handlePasswordInputChange={handlePasswordInputChange}
            handlePasswordSubmit={handlePasswordSubmit}
            loading={loading}
            changingPassword={loadingStates?.changingPassword}
            fieldErrors={fieldErrors}
          />

          {/* Account Management Section */}
          <AccountManager
            handleDisableAccount={handleDisableAccount}
            loading={loading}
            disablingAccount={loadingStates?.disablingAccount}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;

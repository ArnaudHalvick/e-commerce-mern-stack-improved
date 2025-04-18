import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { changePassword as changePasswordAction } from "../../../redux/slices/userSlice";
import {
  validateForm,
  validatePasswordMatch,
  validatePassword,
  isFormValid,
} from "../../../utils/validation";
import { profilePasswordChangeSchema } from "../../../utils/validationSchemas";

const usePasswordForm = (passwordChanged, showSuccess, showError) => {
  const dispatch = useDispatch();

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [hasHandledSuccess, setHasHandledSuccess] = useState(false);

  // Reset form when password is changed successfully (with safeguard against infinite loops)
  useEffect(() => {
    if (passwordChanged && !hasHandledSuccess) {
      setHasHandledSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setPasswordErrors({});
      showSuccess("Password changed successfully!");
    } else if (!passwordChanged && hasHandledSuccess) {
      // Reset the flag when passwordChanged becomes false again
      setHasHandledSuccess(false);
    }
  }, [passwordChanged, showSuccess, hasHandledSuccess]);

  // Clear errors when form is dismissed
  useEffect(() => {
    if (!isChangingPassword) {
      setPasswordErrors({});
    }
  }, [isChangingPassword]);

  // Password input change handler
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field when value changes
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validate current field using the appropriate validation function
    let fieldError = null;

    if (name === "newPassword") {
      const result = validatePassword(value);
      if (!result.isValid) {
        fieldError = { newPassword: result.message };
      }

      // Also validate confirmPassword if it exists
      if (passwordData.confirmPassword) {
        const matchResult = validatePasswordMatch(
          value,
          passwordData.confirmPassword
        );
        if (!matchResult.isValid) {
          fieldError = {
            ...fieldError,
            confirmPassword: matchResult.message,
          };
        }
      }
    } else if (name === "confirmPassword") {
      const matchResult = validatePasswordMatch(
        passwordData.newPassword,
        value
      );
      if (!matchResult.isValid) {
        fieldError = { confirmPassword: matchResult.message };
      }
    }

    if (fieldError) {
      setPasswordErrors((prev) => ({
        ...prev,
        ...fieldError,
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    // Use validateForm with the schema
    const schemaErrors = validateForm(
      passwordData,
      profilePasswordChangeSchema
    );

    setPasswordErrors(schemaErrors);
    return schemaErrors;
  };

  // Password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswordForm();

    if (!isFormValid(validationErrors)) {
      showError("Please fix the errors in the password form.");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await dispatch(
        changePasswordAction({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        })
      ).unwrap();
      // Success is handled by the useEffect that watches passwordChanged
    } catch (error) {
      // Handle specific validation errors
      if (error.validationErrors) {
        // Keep all form data, just show the errors
        setPasswordErrors(error.validationErrors);

        // Only clear the current password field if that specific field has an error
        if (error.validationErrors.currentPassword) {
          setPasswordData((prev) => ({
            ...prev,
            currentPassword: "",
          }));
          // Show a field-specific error message
          showError("Current password is incorrect");
        }
        // Show specific error for same password reuse
        else if (
          error.validationErrors.newPassword &&
          error.message?.includes("different from your current password")
        ) {
          showError(
            "New password must be different from your current password"
          );
        }
        // Generic error for other validation issues
        else {
          showError(error.message || "Please correct the errors in the form");
        }
      } else {
        // For non-validation errors, show the error message
        showError(error.message || "Failed to change password");
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Toggle password change form
  const togglePasswordChange = () => {
    setIsChangingPassword((prev) => !prev);
    // Clear form and errors when hiding
    if (isChangingPassword) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    }
  };

  return {
    passwordData,
    setPasswordData,
    isChangingPassword,
    setIsChangingPassword,
    passwordErrors,
    isSubmittingPassword,
    handlePasswordInputChange,
    handlePasswordSubmit,
    validatePasswordForm,
    togglePasswordChange,
  };
};

export default usePasswordForm;

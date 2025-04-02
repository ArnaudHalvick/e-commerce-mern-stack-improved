import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { changePassword as changePasswordAction } from "../../../redux/slices/userSlice";
import {
  validateForm,
  validatePasswordMatch,
  validatePassword,
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

  // Reset form when password is changed successfully
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

  // Password input change handler
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Special validation for password confirmation
    if (name === "confirmPassword" || name === "newPassword") {
      const newPasswordVal =
        name === "newPassword" ? value : passwordData.newPassword;
      const confirmPasswordVal =
        name === "confirmPassword" ? value : passwordData.confirmPassword;

      if (confirmPasswordVal) {
        const passwordMatchResult = validatePasswordMatch(
          newPasswordVal,
          confirmPasswordVal
        );

        if (!passwordMatchResult.isValid) {
          setPasswordErrors((prev) => ({
            ...prev,
            confirmPassword: passwordMatchResult.error,
          }));
        } else if (passwordErrors.confirmPassword) {
          setPasswordErrors((prev) => {
            const { confirmPassword, ...rest } = prev;
            return rest;
          });
        }
      }
    }

    // Validate new password strength
    if (name === "newPassword" && value) {
      const passwordStrengthResult = validatePassword(value);

      if (!passwordStrengthResult.isValid) {
        setPasswordErrors((prev) => ({
          ...prev,
          newPassword: passwordStrengthResult.error,
        }));
      } else if (passwordErrors.newPassword) {
        setPasswordErrors((prev) => {
          const { newPassword, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    // First validate using the schema
    const schemaErrors = validateForm(
      passwordData,
      profilePasswordChangeSchema
    );

    // Then check password match
    const passwordMatchResult = validatePasswordMatch(
      passwordData.newPassword,
      passwordData.confirmPassword
    );

    // Then check password strength
    const passwordStrengthResult = validatePassword(passwordData.newPassword);

    const errors = {
      ...schemaErrors,
      ...(passwordMatchResult.isValid
        ? {}
        : { confirmPassword: passwordMatchResult.error }),
      ...(passwordStrengthResult.isValid
        ? {}
        : { newPassword: passwordStrengthResult.error }),
    };

    setPasswordErrors(errors);
    return errors;
  };

  // Password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswordForm();

    if (Object.keys(validationErrors).length > 0) {
      showError("Please fix the errors in the password form.");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await dispatch(
        changePasswordAction({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
    } catch (error) {
      showError(error.message || "Failed to change password");
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

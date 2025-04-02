import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  disableAccount as disableAccountAction,
  requestEmailVerification as requestEmailVerificationAction,
  logoutUser,
} from "../../../redux/slices/userSlice";
import { resetCart } from "../../../redux/slices/cartSlice";

const useAccountManagement = (
  user,
  verificationRequested,
  showSuccess,
  showError
) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDisablingAccount, setIsDisablingAccount] = useState(false);

  // Check for query parameters (e.g., tokenExpired)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenExpired = queryParams.get("tokenExpired");

    if (tokenExpired === "true") {
      showError(
        "Your password change request has expired. Please request a new password change."
      );
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [showError]);

  // Handle account disabling
  const handleDisableAccount = async (password) => {
    setIsDisablingAccount(true);

    try {
      await dispatch(disableAccountAction({ password })).unwrap();
      showSuccess("Your account has been disabled. You will be logged out.");

      // Log out the user
      await dispatch(resetCart());
      await dispatch(logoutUser());

      // Redirect to home page
      navigate("/");
    } catch (error) {
      showError(error.message || "Failed to disable account");
    } finally {
      setIsDisablingAccount(false);
    }
  };

  // Handle email verification request
  const handleResendVerification = async () => {
    if (!user?.email) {
      showError("No email address associated with this account.");
      return;
    }

    try {
      await dispatch(requestEmailVerificationAction()).unwrap();
      showSuccess(`Verification email sent to ${user.email}`);
    } catch (error) {
      showError(error.message || "Failed to send verification email");
    }
  };

  return {
    isDisablingAccount,
    verificationRequested,
    handleDisableAccount,
    handleResendVerification,
  };
};

export default useAccountManagement;

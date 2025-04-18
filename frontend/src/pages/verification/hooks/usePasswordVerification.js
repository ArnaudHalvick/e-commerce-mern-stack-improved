import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { verifyPasswordChange } from "../../../redux/slices/userSlice";

/**
 * Custom hook for password change verification functionality
 *
 * @param {string} token The verification token from URL
 * @returns {object} Verification state
 */
const usePasswordVerification = (token) => {
  const dispatch = useDispatch();

  // Use a ref to track if verification was already attempted
  const verificationAttempted = useRef(false);

  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "Verifying your password change request...",
    tokenExpired: false,
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      // Skip if we already attempted verification (prevents duplicate attempts)
      if (verificationAttempted.current) {
        return;
      }

      // Mark that we've attempted verification
      verificationAttempted.current = true;

      // Early return if no token is provided
      if (!token) {
        setVerificationStatus({
          loading: false,
          success: false,
          message: "Missing verification token. Please check your email link.",
          tokenExpired: false,
        });
        return;
      }

      try {
        // Dispatch the action to verify password change
        const result = await dispatch(verifyPasswordChange(token)).unwrap();

        setVerificationStatus({
          loading: false,
          success: true,
          message: result.message || "Password changed successfully!",
          tokenExpired: false,
        });
      } catch (error) {
        console.error("Verification error:", error);

        // Check if token expired
        const isTokenExpired =
          error && typeof error === "object" && error.tokenExpired;

        setVerificationStatus({
          loading: false,
          success: false,
          message:
            error?.message || error || "Verification failed. Please try again.",
          tokenExpired: isTokenExpired,
        });
      }
    };

    verifyToken();
  }, [token, dispatch]);

  return { verificationStatus };
};

export default usePasswordVerification;

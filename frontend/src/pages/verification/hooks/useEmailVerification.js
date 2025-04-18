import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  verifyEmail,
  requestEmailVerification,
} from "../../../redux/slices/userSlice";

/**
 * Custom hook for email verification functionality
 *
 * @param {string} token The verification token from URL
 * @returns {object} Verification state and methods
 */
const useEmailVerification = (token) => {
  const dispatch = useDispatch();

  // Verification status states
  const [verifyingToken, setVerifyingToken] = useState(!!token);
  const [verificationStatus, setVerificationStatus] = useState({
    message: "Verifying your email...",
    success: false,
    alreadyVerified: false,
    expired: false,
  });

  // Resend form states
  const [resendForm, setResendForm] = useState({
    email: "",
    loading: false,
    success: false,
    error: null,
  });

  // Verify token on mount
  useEffect(() => {
    // Only attempt verification if there's a token
    if (!token) {
      setVerificationStatus({
        message:
          "No verification token found. Please check your email for a valid verification link.",
        success: false,
      });
      setVerifyingToken(false);
      return;
    }

    const verifyToken = async () => {
      setVerifyingToken(true);

      try {
        const result = await dispatch(verifyEmail(token)).unwrap();

        // Check for already verified response
        if (result && result.alreadyVerified) {
          setVerificationStatus({
            message: "Your email is already verified!",
            success: true,
            alreadyVerified: true,
          });
        } else {
          setVerificationStatus({
            message: "Your email has been successfully verified!",
            success: true,
          });
        }
      } catch (err) {
        console.error("Verification error:", err);
        const errorMessage =
          typeof err === "string"
            ? err
            : err?.message || "Verification failed. The link may have expired.";

        const isExpired = errorMessage.includes("expired");

        setVerificationStatus({
          message: errorMessage,
          success: false,
          expired: isExpired,
        });
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token, dispatch]);

  // Handle resend verification email
  const handleResendVerification = async (email) => {
    if (!email) {
      setResendForm((prev) => ({
        ...prev,
        error: "Please enter your email address",
      }));
      return;
    }

    setResendForm((prev) => ({
      ...prev,
      email,
      loading: true,
      error: null,
    }));

    try {
      await dispatch(requestEmailVerification(email)).unwrap();
      setResendForm((prev) => ({
        ...prev,
        loading: false,
        success: true,
        email: "", // Clear email after successful send
      }));
    } catch (err) {
      setResendForm((prev) => ({
        ...prev,
        loading: false,
        error: err || "Failed to send verification email",
      }));
    }
  };

  return {
    verifyingToken,
    verificationStatus,
    resendForm,
    handleResendVerification,
  };
};

export default useEmailVerification;

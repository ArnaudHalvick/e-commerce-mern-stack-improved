import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../../utils/imageUtils";

// Styles
import "./VerifyEmail.css"; // Reusing the same styles

/**
 * VerifyPasswordChange component for handling password change verification
 */
const VerifyPasswordChange = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "Verifying your password change request...",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPasswordChange = async () => {
      try {
        // Get token from URL
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (!token) {
          setVerificationStatus({
            loading: false,
            success: false,
            message:
              "Missing verification token. Please check your email link.",
          });
          return;
        }

        // Send verification request
        const response = await axios.get(
          getApiUrl(`users/verify-password-change?token=${token}`)
        );

        setVerificationStatus({
          loading: false,
          success: true,
          message: response.data.message || "Password changed successfully!",
        });
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus({
          loading: false,
          success: false,
          message:
            error.response?.data?.message ||
            "Verification failed. Please try again.",
        });
      }
    };

    verifyPasswordChange();
  }, [location.search]);

  const handleRedirect = () => {
    // Redirect to login or profile based on verification status
    if (verificationStatus.success) {
      navigate("/login");
    } else {
      // If verification failed, go to profile page to try again
      navigate("/profile");
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div
          className={`verification-icon ${
            verificationStatus.loading
              ? "loading"
              : verificationStatus.success
              ? "success"
              : "error"
          }`}
        >
          {verificationStatus.loading ? (
            <div className="spinner"></div>
          ) : verificationStatus.success ? (
            <span>✓</span>
          ) : (
            <span>✗</span>
          )}
        </div>

        <h2 className="verification-title">
          {verificationStatus.loading
            ? "Verifying..."
            : verificationStatus.success
            ? "Success!"
            : "Verification Failed"}
        </h2>

        <p className="verification-message">{verificationStatus.message}</p>

        {!verificationStatus.loading && (
          <button className="verification-button" onClick={handleRedirect}>
            {verificationStatus.success ? "Go to Login" : "Return to Profile"}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyPasswordChange;

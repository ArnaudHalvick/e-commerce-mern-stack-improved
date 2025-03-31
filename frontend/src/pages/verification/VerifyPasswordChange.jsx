import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyPasswordChange } from "../../redux/slices/userSlice";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import Spinner from "../../components/ui/spinner";

// Styles
import "./VerifyEmail.css";

/**
 * VerifyPasswordChange component for handling password change verification
 */
const VerifyPasswordChange = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "Verifying your password change request...",
    tokenExpired: false,
  });

  // Use a ref to track if verification was already attempted
  const verificationAttempted = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyPasswordChangeToken = async () => {
      // Skip if we already attempted verification (prevents duplicate attempts)
      if (verificationAttempted.current) {
        return;
      }

      // Mark that we've attempted verification
      verificationAttempted.current = true;

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
            tokenExpired: false,
          });
          return;
        }

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

    verifyPasswordChangeToken();
  }, [location.search, dispatch]);

  const handleRedirect = () => {
    // If verification failed due to expired token, go to profile to request a new change
    if (verificationStatus.tokenExpired) {
      navigate("/profile?tokenExpired=true");
    }
    // If verification succeeded, go to login page
    else if (verificationStatus.success) {
      navigate("/login");
    }
    // For other errors, go to profile page
    else {
      navigate("/profile");
    }
  };

  return (
    <div className="verification-container">
      <Breadcrumb
        routes={[
          { label: "HOME", path: "/" },
          { label: "VERIFY PASSWORD CHANGE" },
        ]}
      />

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
            <Spinner size="small" showMessage={false} />
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

        {verificationStatus.tokenExpired && (
          <p className="verification-submessage">
            Your password change token has expired. Please return to your
            profile and request a new password change.
          </p>
        )}

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

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import StatusIcon from "./components/StatusIcon";

// Hooks
import usePasswordVerification from "./hooks/usePasswordVerification";

// Styles
import "./styles/Verification.css";

/**
 * VerifyPasswordChange component for handling password change verification
 */
const VerifyPasswordChange = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const { verificationStatus } = usePasswordVerification(token);

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

      <div className="verification-content">
        <StatusIcon
          status={
            verificationStatus.loading
              ? "loading"
              : verificationStatus.success
              ? "success"
              : "error"
          }
        />

        <h2 className="verification-title">
          {verificationStatus.loading
            ? "Verifying..."
            : verificationStatus.success
            ? "Success!"
            : "Verification Failed"}
        </h2>

        <div
          className={`verification-message ${
            verificationStatus.success ? "success" : "error"
          }`}
          role="status"
          aria-live="polite"
        >
          <p>{verificationStatus.message}</p>

          {verificationStatus.tokenExpired && (
            <p className="verification-submessage">
              Your password change token has expired. Please return to your
              profile and request a new password change.
            </p>
          )}
        </div>

        {!verificationStatus.loading && (
          <button
            className="btn-primary"
            onClick={handleRedirect}
            tabIndex="0"
            aria-label={
              verificationStatus.success ? "Go to Login" : "Return to Profile"
            }
            onKeyDown={(e) => e.key === "Enter" && handleRedirect()}
          >
            {verificationStatus.success ? "Go to Login" : "Return to Profile"}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyPasswordChange;

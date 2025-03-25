import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { requestEmailVerification } from "../../redux/slices/userSlice";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// CSS
import "./VerifyEmail.css";

/**
 * Verification pending page - shown after registration
 */
const VerifyPending = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [resendStatus, setResendStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  // Check if email is available, if not redirect to signup
  useEffect(() => {
    if (!email) {
      // Redirect after a small delay to allow development tools to capture logs
      setTimeout(() => {
        navigate("/signup", { replace: true });
      }, 200);
    }
  }, [email, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus({
        loading: false,
        success: false,
        error: "Email address not available. Please go back to registration.",
      });
      return;
    }

    setResendStatus({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await dispatch(requestEmailVerification(email)).unwrap();
      setResendStatus({
        loading: false,
        success: true,
        error: null,
      });
    } catch (err) {
      setResendStatus({
        loading: false,
        success: false,
        error: err || "Failed to resend verification email",
      });
    }
  };

  return (
    <div className="verify-email-container">
      <Breadcrumb
        routes={[{ label: "HOME", path: "/" }, { label: "VERIFY ACCOUNT" }]}
      />

      <div className="verify-email-content">
        <h1>Verify Your Account</h1>

        <div className="verification-pending">
          <div className="email-icon">
            <i className="fas fa-envelope"></i>
          </div>

          <h2>Almost there!</h2>

          <p>
            We've sent a verification email to <strong>{email}</strong>. Please
            check your inbox and click the verification link to complete your
            registration.
          </p>

          <div className="info-box">
            <p>
              <i className="fas fa-info-circle"></i>
              If you don't see the email, please check your spam or junk folder.
            </p>
          </div>

          {resendStatus.success ? (
            <div className="resend-success">
              <p>
                A new verification email has been sent! Please check your inbox.
              </p>
            </div>
          ) : resendStatus.error ? (
            <div className="resend-error">
              <p>{resendStatus.error}</p>
            </div>
          ) : null}

          <div className="actions-container">
            <button
              onClick={handleResendVerification}
              disabled={resendStatus.loading || resendStatus.success}
              className="btn-secondary"
            >
              {resendStatus.loading
                ? "Sending..."
                : resendStatus.success
                ? "Email Sent!"
                : "Resend Verification Email"}
            </button>

            <Link to="/login" className="btn-primary">
              Return to Login
            </Link>
          </div>

          <div className="help-text">
            <p>
              After verifying your email, you'll be able to log in and enjoy all
              the features of our store.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPending;

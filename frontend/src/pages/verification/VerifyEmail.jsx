import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  verifyEmail as verifyEmailAction,
  requestEmailVerification,
} from "../../redux/slices/userSlice";
import { useAuth } from "../../hooks/state";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import Spinner from "../../components/ui/spinner";

// CSS
import "./VerifyEmail.css";

/**
 * Email verification page
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  // Use a separate state for token verification loading
  const [verifyingToken, setVerifyingToken] = useState(!!token);

  const [verificationStatus, setVerificationStatus] = useState({
    message: "Verifying your email...",
    success: false,
    alreadyVerified: false,
    expired: false,
  });
  const [resendForm, setResendForm] = useState({
    email: "",
    loading: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    // Only attempt verification if there's a token
    if (token) {
      const verify = async () => {
        setVerifyingToken(true);
        try {
          const result = await dispatch(verifyEmailAction(token)).unwrap();

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
              : err?.message ||
                "Verification failed. The link may have expired.";

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

      verify();
    } else {
      setVerificationStatus({
        message:
          "No verification token found. Please check your email for a valid verification link.",
        success: false,
      });
      setVerifyingToken(false);
    }
  }, [token, dispatch]);

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!resendForm.email) {
      setResendForm({
        ...resendForm,
        error: "Please enter your email address",
      });
      return;
    }

    setResendForm({
      ...resendForm,
      loading: true,
      error: null,
    });

    try {
      await dispatch(requestEmailVerification(resendForm.email)).unwrap();
      setResendForm({
        ...resendForm,
        loading: false,
        success: true,
        email: "", // Clear email after successful send
      });
    } catch (err) {
      setResendForm({
        ...resendForm,
        loading: false,
        error: err || "Failed to send verification email",
      });
    }
  };

  return (
    <div className="verify-email-container">
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Verify Email" }]}
      />

      <div className="verify-email-content">
        <h1>Email Verification</h1>

        {verifyingToken ? (
          <Spinner
            message="Verifying your email..."
            size="medium"
            className="verify-email-spinner"
          />
        ) : (
          <div
            className={`verification-message ${
              verificationStatus.success ? "success" : "error"
            }`}
          >
            <p>{verificationStatus.message}</p>

            {verificationStatus.success ? (
              <div className="success-actions">
                <p>You can now enjoy all features of our platform.</p>
                {isAuthenticated ? (
                  <Link to="/profile" className="btn-primary">
                    Go to Your Profile
                  </Link>
                ) : (
                  <Link to="/login" className="btn-primary">
                    Login Now
                  </Link>
                )}
                <Link to="/" className="btn-secondary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="error-actions">
                {resendForm.success ? (
                  <div className="resend-success">
                    <p>Verification email sent! Please check your inbox.</p>
                    <Link to="/login" className="btn-secondary mt-3">
                      Return to Login
                    </Link>
                  </div>
                ) : (
                  <>
                    <p>
                      {verificationStatus.expired
                        ? "Your verification link has expired. Please request a new one."
                        : "If you're having trouble, you can request a new verification email."}
                    </p>

                    <form
                      onSubmit={handleResendVerification}
                      className="resend-form"
                    >
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          value={resendForm.email}
                          onChange={(e) =>
                            setResendForm({
                              ...resendForm,
                              email: e.target.value,
                              error: null, // Clear error on change
                            })
                          }
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      {resendForm.error && (
                        <div className="resend-error">
                          <p>{resendForm.error}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={resendForm.loading}
                        className="btn-primary"
                      >
                        {resendForm.loading
                          ? "Sending..."
                          : "Request New Verification Email"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

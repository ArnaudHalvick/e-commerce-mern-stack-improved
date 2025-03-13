import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../redux/slices/userSlice";

// Components
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";

// CSS
import "./CSS/VerifyEmail.css";

/**
 * Email verification page
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isEmailVerified } = useSelector(
    (state) => state.user
  );
  const [verificationStatus, setVerificationStatus] = useState({
    message: "Verifying your email...",
    success: false,
  });

  useEffect(() => {
    // Only attempt verification if there's a token
    if (token) {
      const verify = async () => {
        try {
          await dispatch(verifyEmail(token)).unwrap();
          setVerificationStatus({
            message: "Your email has been successfully verified!",
            success: true,
          });
        } catch (err) {
          setVerificationStatus({
            message: err || "Verification failed. The link may have expired.",
            success: false,
          });
        }
      };

      verify();
    } else {
      setVerificationStatus({
        message:
          "No verification token found. Please check your email for a valid verification link.",
        success: false,
      });
    }
  }, [token, dispatch]);

  return (
    <div className="verify-email-container">
      <Breadcrumb
        routes={[{ label: "HOME", path: "/" }, { label: "VERIFY EMAIL" }]}
      />

      <div className="verify-email-content">
        <h1>Email Verification</h1>

        {loading ? (
          <div className="loading-spinner">
            <p>Verifying your email...</p>
          </div>
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
                <Link to="/profile" className="btn-primary">
                  Go to Your Profile
                </Link>
                <Link to="/" className="btn-secondary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="error-actions">
                <p>
                  If you're having trouble, you can request a new verification
                  email in your profile or by clicking the button below.
                </p>
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  updateUserProfile,
  requestEmailVerification,
} from "../redux/slices/userSlice";

// Components
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";

// CSS
import "./CSS/Profile.css";

/**
 * User profile page component
 */
const Profile = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data with user profile data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
      setIsEditing(false);
    } catch (err) {
      setMessage({
        text: err || "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      await dispatch(requestEmailVerification(user.email)).unwrap();
      setVerificationRequested(true);
      setMessage({
        text: "Verification email has been sent!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err || "Failed to send verification email. Please try again.",
        type: "error",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="profile-container">
        <Breadcrumb
          routes={[{ label: "HOME", path: "/" }, { label: "PROFILE" }]}
        />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Breadcrumb current="My Profile" />

      <div className="profile-content">
        <h1 className="profile-title">My Profile</h1>

        {/* Display Messages */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* Email Verification Status */}
        {user && !user.isEmailVerified && (
          <div className="verification-alert">
            <p>
              Your email is not verified. Please verify your email to access all
              features.
            </p>
            {verificationRequested ? (
              <p className="verification-sent">
                Verification email sent! Please check your inbox.
              </p>
            ) : (
              <button
                className="btn-primary"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Verification Email"}
                {loading && <span className="loading-spinner"></span>}
              </button>
            )}
          </div>
        )}

        <div className="profile-sections">
          {/* Basic Info Section */}
          <section className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Basic Information</h2>
              {!isEditing && (
                <button
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <h3 className="section-title">Shipping Address</h3>

                <div className="form-group">
                  <label htmlFor="street" className="form-label">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country" className="form-label">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    Save Changes
                    {loading && <span className="loading-spinner"></span>}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {user?.username || "Not provided"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {user?.email || "Not provided"}
                      {user?.isEmailVerified && (
                        <span className="verified-badge">Verified</span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {user?.phone || "Not provided"}
                    </span>
                  </div>
                </div>

                <h3 className="section-title">Shipping Address</h3>
                {user?.address &&
                Object.values(user.address).some((value) => value) ? (
                  <div className="address-details">
                    <p className="address-text">
                      {user.address.street && `${user.address.street}, `}
                      {user.address.city && `${user.address.city}, `}
                      {user.address.state && `${user.address.state}, `}
                      {user.address.zipCode && `${user.address.zipCode}, `}
                      {user.address.country}
                    </p>
                  </div>
                ) : (
                  <p className="no-data">No address information</p>
                )}
              </>
            )}
          </section>

          {/* Account Management Section */}
          <section className="profile-section">
            <h2 className="section-title">Account Management</h2>
            <div className="account-actions">
              <Link to="/change-password" className="btn-secondary">
                Change Password
              </Link>
              <button
                className="btn-danger"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete your account? This action cannot be undone."
                    )
                  ) {
                    logout();
                    navigate("/");
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;

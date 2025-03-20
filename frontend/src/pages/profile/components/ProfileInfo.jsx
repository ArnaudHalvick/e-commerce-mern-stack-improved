import React from "react";

/**
 * ProfileInfo component for displaying and editing user's basic information
 */
const ProfileInfo = ({
  isEditing,
  setIsEditing,
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  updatingProfile,
  fieldErrors,
  setFieldErrors,
  displayUserData,
  displayName,
}) => {
  return (
    <section className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Basic Information</h2>
        {!isEditing && (
          <button className="btn-secondary" onClick={() => setIsEditing(true)}>
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
            {fieldErrors.name && (
              <p className="field-error">{fieldErrors.name}</p>
            )}
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
            {fieldErrors.phone && (
              <p className="field-error">{fieldErrors.phone}</p>
            )}
          </div>

          <h3 className="section-title">Shipping Address</h3>

          <div className="form-group">
            <label htmlFor="street" className="form-label">
              Street Address *
            </label>
            <input
              type="text"
              id="street"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            {fieldErrors.street && (
              <p className="field-error">{fieldErrors.street}</p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              {fieldErrors.city && (
                <p className="field-error">{fieldErrors.city}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State/Province *
              </label>
              <input
                type="text"
                id="state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              {fieldErrors.state && (
                <p className="field-error">{fieldErrors.state}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">
                Zip/Postal Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              {fieldErrors.zipCode && (
                <p className="field-error">{fieldErrors.zipCode}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                required
                className="form-input"
              />
              {fieldErrors.country && (
                <p className="field-error">{fieldErrors.country}</p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={updatingProfile}
            >
              {updatingProfile ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setFieldErrors({});
              }}
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
              <span className="detail-value">{displayName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">
                {displayUserData?.email || "Not provided"}
                {displayUserData?.isEmailVerified && (
                  <span className="verified-badge">Verified</span>
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">
                {displayUserData?.phone || "Not provided"}
              </span>
            </div>
          </div>

          <h3 className="section-title">Shipping Address</h3>
          {displayUserData?.address &&
          Object.values(displayUserData.address).some((value) => value) ? (
            <div className="address-details">
              <p className="address-text">
                {displayUserData.address.street &&
                  `${displayUserData.address.street}, `}
                {displayUserData.address.city &&
                  `${displayUserData.address.city}, `}
                {displayUserData.address.state &&
                  `${displayUserData.address.state}, `}
                {displayUserData.address.zipCode &&
                  `${displayUserData.address.zipCode}, `}
                {displayUserData.address.country}
              </p>
            </div>
          ) : (
            <p className="no-data">No address information</p>
          )}
        </>
      )}
    </section>
  );
};

export default ProfileInfo;

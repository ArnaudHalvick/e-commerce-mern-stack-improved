import React, { useState } from "react";
import Spinner from "../../../components/ui/Spinner";

/**
 * ProfileInfo component for displaying and editing user's basic information
 */
const ProfileInfo = ({
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
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const handleBasicInfoSubmit = (e) => {
    e.preventDefault();
    // Only submit name and phone, don't include address at all
    const basicInfoData = {
      name: formData.name,
      phone: formData.phone,
      // Remove address from basic info submission
    };
    handleSubmit(e, basicInfoData);
    setIsEditingBasicInfo(false);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Keep name and phone as is, only update address
    const addressData = {
      name: displayUserData?.name || formData.name,
      phone: displayUserData?.phone || formData.phone,
      address: formData.address,
    };
    handleSubmit(e, addressData);
    setIsEditingAddress(false);
  };

  return (
    <section className="profile-section">
      {/* Basic Information Section */}
      <div className="section-header">
        <h2 className="section-title">Basic Information</h2>
        {!isEditingBasicInfo && !isEditingAddress && (
          <button
            className="btn-secondary"
            onClick={() => setIsEditingBasicInfo(true)}
            tabIndex="0"
            aria-label="Edit basic information"
          >
            Edit
          </button>
        )}
      </div>

      {isEditingBasicInfo ? (
        <form onSubmit={handleBasicInfoSubmit}>
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
              pattern="[0-9]{10,15}"
              title="Phone number must contain 10-15 digits"
            />
            {fieldErrors.phone && (
              <p className="field-error">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditingBasicInfo(false);
                setFieldErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
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
      )}

      {/* Shipping Address Section */}
      <div className="shipping-address-section">
        <div className="section-header">
          <h2 className="section-title">Shipping Address</h2>
          {!isEditingBasicInfo && !isEditingAddress && (
            <button
              className="btn-secondary"
              onClick={() => setIsEditingAddress(true)}
              tabIndex="0"
              aria-label="Edit shipping address"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingAddress ? (
          <form onSubmit={handleAddressSubmit}>
            <div className="address-form">
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
                  required
                  className="form-input"
                />
                {fieldErrors.street && (
                  <p className="field-error">{fieldErrors.street}</p>
                )}
              </div>

              <div className="address-form-row">
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
                    required
                    className="form-input"
                  />
                  {fieldErrors.city && (
                    <p className="field-error">{fieldErrors.city}</p>
                  )}
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
                    required
                    className="form-input"
                  />
                  {fieldErrors.state && (
                    <p className="field-error">{fieldErrors.state}</p>
                  )}
                </div>
              </div>

              <div className="address-form-row">
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
                    required
                    className="form-input"
                    pattern="[0-9a-zA-Z\-\s]{3,10}"
                    title="Please enter a valid zip/postal code (3-10 characters)"
                  />
                  {fieldErrors.zipCode && (
                    <p className="field-error">{fieldErrors.zipCode}</p>
                  )}
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
                    required
                    className="form-input"
                  />
                  {fieldErrors.country && (
                    <p className="field-error">{fieldErrors.country}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <>
                    <Spinner size="small" message="" showMessage={false} />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setIsEditingAddress(false);
                  setFieldErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="address-container">
            {displayUserData?.address &&
            Object.values(displayUserData.address).some((value) => value) ? (
              <div className="address-details">
                <p className="address-text">
                  {displayUserData.address.street && (
                    <span className="address-line">
                      {displayUserData.address.street}
                    </span>
                  )}
                  {displayUserData.address.city &&
                    displayUserData.address.state && (
                      <span className="address-line">
                        {displayUserData.address.city},{" "}
                        {displayUserData.address.state}{" "}
                        {displayUserData.address.zipCode}
                      </span>
                    )}
                  {displayUserData.address.country && (
                    <span className="address-line">
                      {displayUserData.address.country}
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="no-data">No address information</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileInfo;

import React, { useState, useEffect } from "react";
import Spinner from "../../../components/ui/Spinner";

/**
 * ProfileInfo component for displaying and editing user's basic information
 * Uses schema-based validation from backend for instant feedback
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
  validationSchema,
  handleEmailChangeRequest,
  emailVerificationStatus,
}) => {
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailData, setEmailData] = useState({ email: "" });

  // Set initial email data when user data is available
  useEffect(() => {
    if (displayUserData?.email) {
      setEmailData({ email: displayUserData.email });
    }
  }, [displayUserData]);

  // Enhance this method to check for nested fields in the address
  const getInputClass = (fieldName, isNested = false) => {
    if (isNested) {
      const [parent, child] = fieldName.split(".");
      return fieldErrors[parent] && fieldErrors[parent][child]
        ? "form-input error"
        : "form-input";
    }
    return fieldErrors[fieldName] ? "form-input error" : "form-input";
  };

  // Get validation attributes for a field
  const getValidationAttributes = (fieldName, isNested = false) => {
    if (!validationSchema) return {};

    let fieldSchema;

    // Handle nested fields like address.street
    if (isNested) {
      // For nested fields like address.city, split the field name
      const [parent, child] = fieldName.split(".");
      fieldSchema = validationSchema[parent]?.[child];
    } else {
      fieldSchema = validationSchema[fieldName];
    }

    if (!fieldSchema) return {};

    const attributes = {};

    // Add pattern if it exists
    if (fieldSchema.pattern) {
      attributes.pattern = fieldSchema.pattern;
    }

    // Add title with validation message
    if (fieldSchema.message) {
      attributes.title = fieldSchema.message;
    }

    // Add min length if it exists
    if (fieldSchema.minLength) {
      attributes.minLength = fieldSchema.minLength;
    }

    // Add max length if it exists
    if (fieldSchema.maxLength) {
      attributes.maxLength = fieldSchema.maxLength;
    }

    return attributes;
  };

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

  const handleEmailChange = (e) => {
    setEmailData({ email: e.target.value });

    // Clear any previous email field errors
    if (fieldErrors?.email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: null,
      }));
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    // Validate email before submission
    if (validationSchema?.email?.pattern) {
      const pattern = new RegExp(validationSchema.email.pattern);
      if (!pattern.test(emailData.email)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: validationSchema.email.message || "Invalid email format",
        }));
        return;
      }
    }

    handleEmailChangeRequest(emailData.email);
    setIsEditingEmail(false);
  };

  return (
    <section className="profile-section">
      {/* Basic Information Section */}
      <div className="section-header">
        <h2 className="section-title">Basic Information</h2>
        {!isEditingBasicInfo && !isEditingAddress && !isEditingEmail && (
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
        <form onSubmit={handleBasicInfoSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name{" "}
              {validationSchema?.name?.required && (
                <span className="required">*</span>
              )}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={getInputClass("name")}
              aria-invalid={fieldErrors?.name ? "true" : "false"}
              aria-describedby={fieldErrors?.name ? "name-error" : undefined}
              {...getValidationAttributes("name")}
            />
            {fieldErrors?.name && (
              <div className="field-error" id="name-error" role="alert">
                {fieldErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className={getInputClass("phone")}
              aria-invalid={fieldErrors?.phone ? "true" : "false"}
              aria-describedby={fieldErrors?.phone ? "phone-error" : undefined}
              {...getValidationAttributes("phone")}
            />
            {fieldErrors?.phone && (
              <div className="field-error" id="phone-error" role="alert">
                {fieldErrors.phone}
              </div>
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
          {/* Email Information Section */}
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">
              {displayUserData?.email || "Not provided"}
              {displayUserData?.isEmailVerified && (
                <span className="verified-badge">Verified</span>
              )}
            </span>
            {!isEditingEmail && !isEditingBasicInfo && !isEditingAddress && (
              <button
                className="btn-text btn-edit-email"
                onClick={() => setIsEditingEmail(true)}
                tabIndex="0"
                aria-label="Edit email address"
              >
                Edit
              </button>
            )}
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">
              {displayUserData?.phone || "Not provided"}
            </span>
          </div>
        </div>
      )}

      {/* Email Edit Form */}
      {isEditingEmail && (
        <form onSubmit={handleEmailSubmit} noValidate className="email-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={emailData.email}
              onChange={handleEmailChange}
              required
              className={getInputClass("email")}
              aria-invalid={fieldErrors?.email ? "true" : "false"}
              aria-describedby={fieldErrors?.email ? "email-error" : undefined}
              {...getValidationAttributes("email")}
            />
            {fieldErrors?.email && (
              <div className="field-error" id="email-error" role="alert">
                {fieldErrors.email}
              </div>
            )}
            <p className="form-note">
              After changing your email, a verification link will be sent to the
              new address. Your email will only be updated after verification.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={
                updatingProfile || emailData.email === displayUserData?.email
              }
            >
              {updatingProfile ? (
                <>
                  <Spinner size="small" message="" showMessage={false} />
                  Saving...
                </>
              ) : (
                "Save Email"
              )}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditingEmail(false);
                setFieldErrors({});
                setEmailData({ email: displayUserData?.email || "" });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Verification Status Message */}
      {emailVerificationStatus && (
        <div className={`verification-message ${emailVerificationStatus.type}`}>
          {emailVerificationStatus.message}
        </div>
      )}

      {/* Shipping Address Section */}
      <div className="shipping-address-section">
        <div className="section-header">
          <h2 className="section-title">Shipping Address</h2>
          {!isEditingBasicInfo && !isEditingAddress && !isEditingEmail && (
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
          <form onSubmit={handleAddressSubmit} noValidate>
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
                  className={getInputClass("address.street", true)}
                  aria-invalid={fieldErrors?.address?.street ? "true" : "false"}
                  aria-describedby={
                    fieldErrors?.address?.street ? "street-error" : undefined
                  }
                  {...getValidationAttributes("address.street", true)}
                />
                {fieldErrors?.address?.street && (
                  <div className="field-error" id="street-error" role="alert">
                    {fieldErrors.address.street}
                  </div>
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
                    className={getInputClass("address.city", true)}
                    aria-invalid={fieldErrors?.address?.city ? "true" : "false"}
                    aria-describedby={
                      fieldErrors?.address?.city ? "city-error" : undefined
                    }
                    {...getValidationAttributes("address.city", true)}
                  />
                  {fieldErrors?.address?.city && (
                    <div className="field-error" id="city-error" role="alert">
                      {fieldErrors.address.city}
                    </div>
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
                    className={getInputClass("address.state", true)}
                    aria-invalid={
                      fieldErrors?.address?.state ? "true" : "false"
                    }
                    aria-describedby={
                      fieldErrors?.address?.state ? "state-error" : undefined
                    }
                    {...getValidationAttributes("address.state", true)}
                  />
                  {fieldErrors?.address?.state && (
                    <div className="field-error" id="state-error" role="alert">
                      {fieldErrors.address.state}
                    </div>
                  )}
                </div>
              </div>

              <div className="address-form-row">
                <div className="form-group">
                  <label htmlFor="zipCode" className="form-label">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    required
                    className={getInputClass("address.zipCode", true)}
                    aria-invalid={
                      fieldErrors?.address?.zipCode ? "true" : "false"
                    }
                    aria-describedby={
                      fieldErrors?.address?.zipCode
                        ? "zipCode-error"
                        : undefined
                    }
                    {...getValidationAttributes("address.zipCode", true)}
                  />
                  {fieldErrors?.address?.zipCode && (
                    <div
                      className="field-error"
                      id="zipCode-error"
                      role="alert"
                    >
                      {fieldErrors.address.zipCode}
                    </div>
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
                    className={getInputClass("address.country", true)}
                    aria-invalid={
                      fieldErrors?.address?.country ? "true" : "false"
                    }
                    aria-describedby={
                      fieldErrors?.address?.country
                        ? "country-error"
                        : undefined
                    }
                    {...getValidationAttributes("address.country", true)}
                  />
                  {fieldErrors?.address?.country && (
                    <div
                      className="field-error"
                      id="country-error"
                      role="alert"
                    >
                      {fieldErrors.address.country}
                    </div>
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

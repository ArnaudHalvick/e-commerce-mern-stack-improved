import React, { useState } from "react";
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
}) => {
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Enhance this method to check for nested fields in the address
  const getInputClass = (fieldName, isNested = false) => {
    if (isNested) {
      const [parent, child] = fieldName.split(".");
      return fieldErrors[parent] && fieldErrors[parent][child]
        ? "profile-form-input error"
        : "profile-form-input";
    }
    return fieldErrors[fieldName]
      ? "profile-form-input error"
      : "profile-form-input";
  };

  // Get validation attributes for a field
  const getValidationAttributes = (fieldName, isNested = false) => {
    if (!validationSchema) return {};

    let fieldSchema;

    // Handle nested fields like address.street
    if (isNested) {
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
    <>
      {/* Basic Information Section */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Basic Information</h2>
          {!isEditingBasicInfo && !isEditingAddress && (
            <button
              className="profile-btn-secondary"
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
            <div className="profile-form-group">
              <label htmlFor="name" className="profile-form-label">
                Name{" "}
                {validationSchema?.name?.required && (
                  <span className="profile-required">*</span>
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
                <div
                  className="profile-field-error"
                  id="name-error"
                  role="alert"
                >
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone" className="profile-form-label">
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
                aria-describedby={
                  fieldErrors?.phone ? "phone-error" : undefined
                }
                {...getValidationAttributes("phone")}
              />
              {fieldErrors?.phone && (
                <div
                  className="profile-field-error"
                  id="phone-error"
                  role="alert"
                >
                  {fieldErrors.phone}
                </div>
              )}
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-btn-primary"
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
                className="profile-btn-secondary"
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
          <div className="profile-profile-details">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Name:</span>
              <span className="profile-detail-value">{displayName}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Phone:</span>
              <span className="profile-detail-value">
                {displayUserData?.phone || "Not provided"}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Shipping Address Section */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Shipping Address</h2>
          {!isEditingBasicInfo && !isEditingAddress && (
            <button
              className="profile-btn-secondary"
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
            <div className="profile-address-form">
              <div className="profile-form-group">
                <label htmlFor="street" className="profile-form-label">
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
                  <div
                    className="profile-field-error"
                    id="street-error"
                    role="alert"
                  >
                    {fieldErrors.address.street}
                  </div>
                )}
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label htmlFor="city" className="profile-form-label">
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
                    <div
                      className="profile-field-error"
                      id="city-error"
                      role="alert"
                    >
                      {fieldErrors.address.city}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="state" className="profile-form-label">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
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
                    <div
                      className="profile-field-error"
                      id="state-error"
                      role="alert"
                    >
                      {fieldErrors.address.state}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label htmlFor="zipCode" className="profile-form-label">
                    Zip/Postal Code
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
                      className="profile-field-error"
                      id="zipCode-error"
                      role="alert"
                    >
                      {fieldErrors.address.zipCode}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="country" className="profile-form-label">
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
                      className="profile-field-error"
                      id="country-error"
                      role="alert"
                    >
                      {fieldErrors.address.country}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-btn-primary"
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
                  className="profile-btn-secondary"
                  onClick={() => {
                    setIsEditingAddress(false);
                    setFieldErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile-address-container">
            {displayUserData?.address?.street ? (
              <div className="profile-address-details">
                <div className="profile-address-line">
                  {displayUserData.address.street}
                </div>
                <div className="profile-address-line">
                  {displayUserData.address.zipCode &&
                    `${displayUserData.address.zipCode}, `}
                  {displayUserData.address.city}
                </div>
                <div className="profile-address-line">
                  {displayUserData.address.state &&
                    `${displayUserData.address.state}, `}
                  {displayUserData.address.country}
                </div>
              </div>
            ) : (
              <p className="profile-no-data">No shipping address provided</p>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default ProfileInfo;

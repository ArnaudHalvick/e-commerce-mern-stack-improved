import React, { useState, useEffect } from "react";
import Spinner from "../../../components/ui/Spinner";
import { useError } from "../../../context/ErrorContext";

/**
 * ProfileInfo component for displaying and editing user's basic information
 * Uses schema-based validation from backend for instant feedback
 */
const ProfileInfo = ({
  formData,
  setFormData,
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
  const { showError } = useError();
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Validate basic info form when data or errors change
  useEffect(() => {
    if (!validationSchema || !formData) {
      setIsBasicInfoValid(false);
      return;
    }

    // Check if required fields have values
    const requiredFields = Object.keys(validationSchema).filter(
      (key) => validationSchema[key]?.required && key !== "address"
    );

    // Check if all required fields have values
    const hasAllRequiredFields = requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== ""
    );

    // Check if there are any field errors (excluding address errors)
    const hasFieldErrors =
      fieldErrors &&
      Object.keys(fieldErrors).some(
        (key) => fieldErrors[key] && key !== "address"
      );

    setIsBasicInfoValid(hasAllRequiredFields && !hasFieldErrors);
  }, [formData, fieldErrors, validationSchema]);

  // Validate address form when data or errors change
  useEffect(() => {
    if (!validationSchema?.address || !formData?.address) {
      setIsAddressValid(false);
      return;
    }

    // Check if all address fields have values (make all fields required regardless of backend schema)
    const requiredAddressFields = [
      "street",
      "city",
      "zipCode",
      "country",
      "state",
    ]; // All fields are required

    // Check if all required address fields have values
    const hasAllRequiredFields = requiredAddressFields.every(
      (field) =>
        formData.address[field] && formData.address[field].trim() !== ""
    );

    // Check if there are any address field errors
    const hasAddressErrors =
      fieldErrors?.address &&
      Object.keys(fieldErrors.address).some((key) => fieldErrors.address[key]);

    setIsAddressValid(hasAllRequiredFields && !hasAddressErrors);
  }, [formData, fieldErrors, validationSchema]);

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

  const handleBasicInfoSubmitWithValidation = (e) => {
    e.preventDefault();

    // If form is not valid, show error and prevent submission
    if (!isBasicInfoValid) {
      showError("Please fix the validation errors before submitting");
      return;
    }

    // Only submit name and phone, don't include address at all
    const basicInfoData = {
      name: formData.name,
      phone: formData.phone,
    };
    handleSubmit(e, basicInfoData);
    setIsEditingBasicInfo(false);
  };

  const handleAddressSubmitWithValidation = (e) => {
    e.preventDefault();

    // If form is not valid, show error and prevent submission
    if (!isAddressValid) {
      showError("Please fix the validation errors before submitting");
      return;
    }

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
              disabled={loading || updatingProfile}
            >
              Edit
            </button>
          )}
        </div>

        {isEditingBasicInfo ? (
          <form onSubmit={handleBasicInfoSubmitWithValidation} noValidate>
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
                required={validationSchema?.name?.required}
                className={getInputClass("name")}
                aria-invalid={fieldErrors?.name ? "true" : "false"}
                aria-describedby={fieldErrors?.name ? "name-error" : undefined}
                disabled={loading || updatingProfile}
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
                disabled={loading || updatingProfile}
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
                className={
                  isBasicInfoValid
                    ? "profile-btn-primary"
                    : "profile-btn-disabled"
                }
                disabled={loading || updatingProfile || !isBasicInfoValid}
              >
                {updatingProfile ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={() => {
                  setIsEditingBasicInfo(false);
                  // Reset basic info form to original values
                  setFormData((prev) => ({
                    ...prev,
                    name:
                      displayUserData?.name || displayUserData?.username || "",
                    phone: displayUserData?.phone || "",
                  }));
                  setFieldErrors({});
                }}
                disabled={loading || updatingProfile}
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
              disabled={loading || updatingProfile}
            >
              Edit
            </button>
          )}
        </div>

        {isEditingAddress ? (
          <form onSubmit={handleAddressSubmitWithValidation} noValidate>
            <div className="profile-address-form">
              <div className="profile-form-group">
                <label htmlFor="street" className="profile-form-label">
                  Street Address <span className="profile-required">*</span>
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
                  disabled={loading || updatingProfile}
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
                    City <span className="profile-required">*</span>
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
                    disabled={loading || updatingProfile}
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
                    State/Province <span className="profile-required">*</span>
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
                    disabled={loading || updatingProfile}
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
                    Zip/Postal Code <span className="profile-required">*</span>
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
                    disabled={loading || updatingProfile}
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
                    Country <span className="profile-required">*</span>
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
                    disabled={loading || updatingProfile}
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
                  className={
                    isAddressValid
                      ? "profile-btn-primary"
                      : "profile-btn-disabled"
                  }
                  disabled={loading || updatingProfile || !isAddressValid}
                >
                  {updatingProfile ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  className="profile-btn-secondary"
                  onClick={() => {
                    setIsEditingAddress(false);
                    // Reset address form to original values
                    setFormData((prev) => ({
                      ...prev,
                      address: {
                        street: displayUserData?.address?.street || "",
                        city: displayUserData?.address?.city || "",
                        state: displayUserData?.address?.state || "",
                        zipCode: displayUserData?.address?.zipCode || "",
                        country: displayUserData?.address?.country || "",
                      },
                    }));
                    // Reset address form errors
                    setFieldErrors((prev) => ({
                      ...prev,
                      address: {},
                    }));
                  }}
                  disabled={loading || updatingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile-address-container">
            {displayUserData?.address?.street ||
            displayUserData?.address?.city ||
            displayUserData?.address?.state ||
            displayUserData?.address?.zipCode ||
            displayUserData?.address?.country ? (
              <div className="profile-address-details">
                <p className="profile-address-text">
                  {displayUserData?.address?.street && (
                    <span className="profile-address-line">
                      {displayUserData.address.street}
                      <br />
                    </span>
                  )}
                  {displayUserData?.address?.city && (
                    <>
                      {displayUserData.address.city}
                      {displayUserData?.address?.state && (
                        <>, {displayUserData.address.state}</>
                      )}
                      {displayUserData?.address?.zipCode && (
                        <> {displayUserData.address.zipCode}</>
                      )}
                      <br />
                    </>
                  )}
                  {displayUserData?.address?.country && (
                    <span className="profile-address-line">
                      {displayUserData.address.country}
                    </span>
                  )}
                </p>
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

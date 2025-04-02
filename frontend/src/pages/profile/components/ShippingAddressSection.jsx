import React, { useState, useEffect } from "react";
import { FormInputField, FormSubmitButton } from "../../../components/form";

/**
 * ShippingAddressSection component for displaying and editing user's shipping address
 */
const ShippingAddressSection = ({
  formData,
  fieldErrors,
  handleInputChange,
  handleSubmit,
  isSubmitting,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [localFormData, setLocalFormData] = useState({
    address: { ...formData.address },
  });

  // Update local form data when props change and not in edit mode
  useEffect(() => {
    if (!isEditingAddress) {
      setLocalFormData({
        address: { ...formData.address },
      });
    }
  }, [formData, isEditingAddress]);

  // Validate address form when data or errors change
  useEffect(() => {
    if (!localFormData?.address) {
      setIsAddressValid(false);
      return;
    }

    // Check if at least the critical address fields have values (street, city, zipCode, country)
    const criticalAddressFields = ["street", "city", "zipCode", "country"];

    // Check if there are any values in the address fields - at least one field must be filled
    const hasAnyAddressField = Object.keys(localFormData.address).some(
      (field) =>
        localFormData.address[field] &&
        localFormData.address[field].trim() !== ""
    );

    // If no address fields are provided, form is valid (empty address is allowed)
    if (!hasAnyAddressField) {
      setIsAddressValid(true);
      return;
    }

    // If address is being provided, critical fields are required
    const hasAllCriticalFields = hasAnyAddressField
      ? criticalAddressFields.every(
          (field) =>
            localFormData.address[field] &&
            localFormData.address[field].trim() !== ""
        )
      : true;

    // Check if there are any address field errors
    const hasAddressErrors =
      fieldErrors?.address &&
      Object.keys(fieldErrors.address).some((key) => fieldErrors.address[key]);

    setIsAddressValid(hasAllCriticalFields && !hasAddressErrors);
  }, [localFormData, fieldErrors]);

  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setLocalFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    }

    handleInputChange(e);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    // Check if any address fields are filled
    const hasAnyAddressField = Object.keys(localFormData.address).some(
      (field) =>
        localFormData.address[field] &&
        localFormData.address[field].trim() !== ""
    );

    // If address is empty, don't validate and submit as empty
    if (!hasAnyAddressField) {
      const emptyAddress = {
        name: formData.name,
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      };
      handleSubmit(e, emptyAddress);
      setIsEditingAddress(false);
      return;
    }

    // If form is not valid, prevent submission
    if (!isAddressValid) {
      return;
    }

    // Submit address data along with the required name field
    handleSubmit(e, {
      name: formData.name,
      address: localFormData.address,
    });
    setIsEditingAddress(false);
  };

  const handleCancel = () => {
    setIsEditingAddress(false);
    setLocalFormData({
      address: { ...formData.address },
    });
  };

  return (
    <section className="profile-section profile-address-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Shipping Address</h2>
        {!isEditingAddress && (
          <FormSubmitButton
            type="button"
            variant="secondary"
            size="small"
            text="Edit"
            onClick={() => setIsEditingAddress(true)}
            aria-label="Edit shipping address"
          />
        )}
      </div>

      {isEditingAddress ? (
        <form onSubmit={handleAddressSubmit} noValidate>
          <div className="profile-form-group">
            <FormInputField
              type="text"
              name="address.street"
              value={localFormData.address.street}
              onChange={handleLocalInputChange}
              label="Street Address"
              required
              error={fieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                fieldErrors?.address?.street
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />
          </div>

          <div className="profile-form-row">
            <FormInputField
              type="text"
              name="address.city"
              value={localFormData.address.city}
              onChange={handleLocalInputChange}
              label="City"
              required
              error={fieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                fieldErrors?.address?.city
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />

            <FormInputField
              type="text"
              name="address.state"
              value={localFormData.address.state}
              onChange={handleLocalInputChange}
              label="State/Province"
              required
              error={fieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                fieldErrors?.address?.state
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />
          </div>

          <div className="profile-form-row">
            <FormInputField
              type="text"
              name="address.zipCode"
              value={localFormData.address.zipCode}
              onChange={handleLocalInputChange}
              label="Zip/Postal Code"
              required
              error={fieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                fieldErrors?.address?.zipCode
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />

            <FormInputField
              type="text"
              name="address.country"
              value={localFormData.address.country}
              onChange={handleLocalInputChange}
              label="Country"
              required
              error={fieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                fieldErrors?.address?.country
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />
          </div>

          <div className="profile-form-actions">
            <FormSubmitButton
              type="submit"
              text={isSubmitting ? "Saving..." : "Save Changes"}
              isLoading={isSubmitting}
              disabled={!isAddressValid || isSubmitting}
              variant="primary"
              size="small"
              aria-label="Save shipping address changes"
            />
            <FormSubmitButton
              type="button"
              text="Cancel"
              variant="secondary"
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel shipping address editing"
            />
          </div>
        </form>
      ) : (
        <div className="profile-profile-details">
          {formData.address &&
          Object.values(formData.address).some((val) => val) ? (
            <>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Street:</span>
                <span className="profile-detail-value">
                  {formData.address.street || "Not provided"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">City:</span>
                <span className="profile-detail-value">
                  {formData.address.city || "Not provided"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">State/Province:</span>
                <span className="profile-detail-value">
                  {formData.address.state || "Not provided"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Zip/Postal Code:</span>
                <span className="profile-detail-value">
                  {formData.address.zipCode || "Not provided"}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Country:</span>
                <span className="profile-detail-value">
                  {formData.address.country || "Not provided"}
                </span>
              </div>
            </>
          ) : (
            <div className="profile-detail-item">
              <span className="profile-detail-value">
                No shipping address provided
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ShippingAddressSection;

import React, { useState, useEffect } from "react";
import { useError } from "../../../context/ErrorContext";
import FormInputField from "../../../components/form/FormInputField";
import FormSubmitButton from "../../../components/form/FormSubmitButton";

/**
 * ShippingAddressSection component for displaying and editing user's shipping address
 * Uses schema-based validation from backend for instant feedback
 */
const ShippingAddressSection = ({
  formData,
  setFormData,
  handleInputChange,
  handleSubmit,
  loading,
  updatingProfile,
  fieldErrors,
  setFieldErrors,
  displayUserData,
  validationSchema,
}) => {
  const { showError } = useError();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Validate address form when data or errors change
  useEffect(() => {
    if (!formData?.address) {
      setIsAddressValid(false);
      return;
    }

    // Check if at least the critical address fields have values (street, city, zipCode, country)
    const criticalAddressFields = ["street", "city", "zipCode", "country"];

    // Check if there are any values in the address fields - at least one field must be filled
    const hasAnyAddressField = Object.keys(formData.address).some(
      (field) =>
        formData.address[field] && formData.address[field].trim() !== ""
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
            formData.address[field] && formData.address[field].trim() !== ""
        )
      : true;

    // Check if there are any address field errors
    const hasAddressErrors =
      fieldErrors?.address &&
      Object.keys(fieldErrors.address).some((key) => fieldErrors.address[key]);

    setIsAddressValid(hasAllCriticalFields && !hasAddressErrors);
  }, [formData, fieldErrors]);

  const handleAddressSubmitWithValidation = (e) => {
    e.preventDefault();

    // Check if any address fields are filled
    const hasAnyAddressField = Object.keys(formData.address).some(
      (field) =>
        formData.address[field] && formData.address[field].trim() !== ""
    );

    // If address is empty, don't validate and submit as empty
    if (!hasAnyAddressField) {
      const emptyAddress = {
        name:
          formData.name || displayUserData?.name || displayUserData?.username,
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

    // If form is not valid, show error and prevent submission
    if (!isAddressValid) {
      showError("Please fix the validation errors before submitting");
      return;
    }

    // Submit address data along with the required name field
    handleSubmit(e, {
      name: formData.name || displayUserData?.name || displayUserData?.username,
      address: formData.address,
    });
    setIsEditingAddress(false);
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
          />
        )}
      </div>

      {isEditingAddress ? (
        <form onSubmit={handleAddressSubmitWithValidation} noValidate>
          <div className="profile-form-group">
            <FormInputField
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              label="Street Address"
              required
              error={fieldErrors}
              disabled={loading || updatingProfile}
              validationSchema={validationSchema}
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
              value={formData.address.city}
              onChange={handleInputChange}
              label="City"
              required
              error={fieldErrors}
              disabled={loading || updatingProfile}
              validationSchema={validationSchema}
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
              value={formData.address.state}
              onChange={handleInputChange}
              label="State/Province"
              required
              error={fieldErrors}
              disabled={loading || updatingProfile}
              validationSchema={validationSchema}
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
              value={formData.address.zipCode}
              onChange={handleInputChange}
              label="Zip/Postal Code"
              required
              error={fieldErrors}
              disabled={loading || updatingProfile}
              validationSchema={validationSchema}
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
              value={formData.address.country}
              onChange={handleInputChange}
              label="Country"
              required
              error={fieldErrors}
              disabled={loading || updatingProfile}
              validationSchema={validationSchema}
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
              text={updatingProfile ? "Saving..." : "Save Changes"}
              isLoading={updatingProfile}
              disabled={!isAddressValid}
              variant="primary"
              size="small"
            />
            <FormSubmitButton
              type="button"
              text="Cancel"
              variant="secondary"
              size="small"
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
                // Clear validation errors
                setFieldErrors({});
              }}
              disabled={loading || updatingProfile}
            />
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
  );
};

export default ShippingAddressSection;

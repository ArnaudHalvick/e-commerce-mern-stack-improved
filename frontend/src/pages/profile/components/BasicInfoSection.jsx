import React, { useState, useEffect } from "react";
import { FormInputField, FormSubmitButton } from "../../../components/form";

/**
 * BasicInfoSection component for displaying and editing user's basic information
 */
const BasicInfoSection = ({
  formData,
  fieldErrors,
  handleInputChange,
  handleSubmit,
  isSubmitting,
}) => {
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);
  const [localFormData, setLocalFormData] = useState({ ...formData });

  // Update local form data when props change and not in edit mode
  useEffect(() => {
    if (!isEditingBasicInfo) {
      setLocalFormData({ ...formData });
    }
  }, [formData, isEditingBasicInfo]);

  // Validate basic info form when data or errors change
  useEffect(() => {
    if (!localFormData) {
      setIsBasicInfoValid(false);
      return;
    }

    // Name is required and must be valid
    const hasValidName =
      localFormData.name && localFormData.name.trim().length >= 2;

    // Check if there are any field errors (excluding address errors)
    const hasFieldErrors =
      fieldErrors &&
      Object.keys(fieldErrors).some(
        (key) => fieldErrors[key] && key !== "address"
      );

    setIsBasicInfoValid(hasValidName && !hasFieldErrors);
  }, [localFormData, fieldErrors]);

  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    handleInputChange(e);
  };

  const handleBasicInfoSubmit = (e) => {
    e.preventDefault();

    // If form is not valid, prevent submission
    if (!isBasicInfoValid) {
      return;
    }

    // Only submit name and phone, don't include address
    const basicInfoData = {
      name: localFormData.name,
      phone: localFormData.phone || "",
    };

    handleSubmit(e, basicInfoData);
    setIsEditingBasicInfo(false);
  };

  const handleCancel = () => {
    setIsEditingBasicInfo(false);
    setLocalFormData({ ...formData });
  };

  return (
    <section className="profile-section profile-info-section">
      <div className="profile-section-header">
        <h2 className="profile-section-title">Basic Information</h2>
        {!isEditingBasicInfo && (
          <FormSubmitButton
            type="button"
            variant="secondary"
            size="small"
            text="Edit"
            onClick={() => setIsEditingBasicInfo(true)}
          />
        )}
      </div>

      {isEditingBasicInfo ? (
        <form onSubmit={handleBasicInfoSubmit} noValidate>
          <FormInputField
            type="text"
            name="name"
            value={localFormData.name}
            onChange={handleLocalInputChange}
            label="Name"
            required={true}
            error={fieldErrors}
            disabled={isSubmitting}
            containerClassName="profile-form-group"
            labelClassName="profile-form-label"
            className={
              fieldErrors?.name
                ? "profile-form-input error"
                : "profile-form-input"
            }
          />

          <FormInputField
            type="tel"
            name="phone"
            value={localFormData.phone || ""}
            onChange={handleLocalInputChange}
            label="Phone"
            error={fieldErrors}
            disabled={isSubmitting}
            containerClassName="profile-form-group"
            labelClassName="profile-form-label"
            className={
              fieldErrors?.phone
                ? "profile-form-input error"
                : "profile-form-input"
            }
          />

          <div className="profile-form-actions">
            <FormSubmitButton
              type="submit"
              text={isSubmitting ? "Saving..." : "Save Changes"}
              isLoading={isSubmitting}
              disabled={!isBasicInfoValid || isSubmitting}
              variant="primary"
              size="small"
              aria-label="Save basic information changes"
            />
            <FormSubmitButton
              type="button"
              text="Cancel"
              variant="secondary"
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel basic information editing"
            />
          </div>
        </form>
      ) : (
        <div className="profile-profile-details">
          <div className="profile-detail-item">
            <span className="profile-detail-label">Name:</span>
            <span className="profile-detail-value">
              {formData.name || "Not provided"}
            </span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Phone:</span>
            <span className="profile-detail-value">
              {formData.phone || "Not provided"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default BasicInfoSection;

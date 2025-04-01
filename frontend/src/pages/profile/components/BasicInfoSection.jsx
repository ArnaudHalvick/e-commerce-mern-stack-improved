import React, { useState, useEffect } from "react";
import { useError } from "../../../context/ErrorContext";
import { FormInputField, FormSubmitButton } from "../../../components/form";

/**
 * BasicInfoSection component for displaying and editing user's basic information
 * Uses schema-based validation from backend for instant feedback
 */
const BasicInfoSection = ({
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
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);

  // Validate basic info form when data or errors change
  useEffect(() => {
    if (!formData) {
      setIsBasicInfoValid(false);
      return;
    }

    // Name is required and must be valid
    const hasValidName = formData.name && formData.name.trim().length >= 2;

    // Check if there are any field errors (excluding address errors)
    const hasFieldErrors =
      fieldErrors &&
      Object.keys(fieldErrors).some(
        (key) => fieldErrors[key] && key !== "address"
      );

    setIsBasicInfoValid(hasValidName && !hasFieldErrors);
  }, [formData, fieldErrors]);

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
        <form onSubmit={handleBasicInfoSubmitWithValidation} noValidate>
          <FormInputField
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            label="Name"
            required={validationSchema?.name?.required}
            error={fieldErrors}
            disabled={loading || updatingProfile}
            validationSchema={validationSchema}
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
            value={formData.phone || ""}
            onChange={handleInputChange}
            label="Phone"
            error={fieldErrors}
            disabled={loading || updatingProfile}
            validationSchema={validationSchema}
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
              text={updatingProfile ? "Saving..." : "Save Changes"}
              isLoading={updatingProfile}
              disabled={!isBasicInfoValid}
              variant="primary"
              size="small"
            />
            <FormSubmitButton
              type="button"
              text="Cancel"
              variant="secondary"
              size="small"
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
            />
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
  );
};

export default BasicInfoSection;

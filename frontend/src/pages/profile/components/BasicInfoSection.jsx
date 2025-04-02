import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import { debounce } from "lodash";

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
  const [localFieldErrors, setLocalFieldErrors] = useState({});
  const [initialFormData, setInitialFormData] = useState({ ...formData });

  // Set initial form data when edit mode is activated
  useEffect(() => {
    if (!isEditingBasicInfo) {
      setLocalFormData({ ...formData });
      setInitialFormData({ ...formData });
    }
  }, [formData, isEditingBasicInfo]);

  // Function to validate a single field
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "name":
        if (!value || value.trim() === "") {
          return "Name is required";
        } else if (value.trim().length < 2) {
          return "Name must be at least 2 characters";
        }
        return null;

      case "phone":
        if (!value || value.trim() === "") {
          return "Phone number is required";
        }

        // Basic phone validation - should be at least 10 digits
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) {
          return "Phone number must have at least 10 digits";
        }

        // Check if it's a valid format with regex
        // This allows formats like: +1 (123) 456-7890, 123-456-7890, (123) 456-7890, etc.
        const phoneRegex =
          /^(\+\d{1,3}( )?)?((\(\d{1,3}\))|\d{1,3})[- .]?\d{3,4}[- .]?\d{4}$/;
        if (!phoneRegex.test(value)) {
          return "Please enter a valid phone number";
        }
        return null;

      default:
        return null;
    }
  }, []);

  // Validate basic info form when data or errors change
  useEffect(() => {
    if (!localFormData) {
      setIsBasicInfoValid(false);
      return;
    }

    // Name is required and must be valid
    const hasValidName =
      localFormData.name && localFormData.name.trim().length >= 2;

    // Phone is required and must be valid
    const hasValidPhone =
      localFormData.phone &&
      localFormData.phone.trim() !== "" &&
      !validateField("phone", localFormData.phone);

    // Check if there are any field errors (excluding address errors)
    const hasFieldErrors =
      localFieldErrors &&
      Object.keys(localFieldErrors).some(
        (key) => localFieldErrors[key] && key !== "address"
      );

    setIsBasicInfoValid(hasValidName && hasValidPhone && !hasFieldErrors);

    // Update local field errors from parent
    if (fieldErrors && !isEditingBasicInfo) {
      setLocalFieldErrors(fieldErrors);
    }
  }, [
    localFormData,
    fieldErrors,
    localFieldErrors,
    isEditingBasicInfo,
    validateField,
  ]);

  // Immediately validate fields when editing starts
  useEffect(() => {
    if (isEditingBasicInfo) {
      const nameError = validateField("name", localFormData.name);
      const phoneError = validateField("phone", localFormData.phone || "");

      const newErrors = {};
      if (nameError) newErrors.name = nameError;
      if (phoneError) newErrors.phone = phoneError;

      setLocalFieldErrors(newErrors);
    }
  }, [isEditingBasicInfo, validateField, localFormData]);

  // Debounced validation function
  const debouncedValidation = useMemo(
    () =>
      debounce((name, value) => {
        const error = validateField(name, value);

        if (error) {
          setLocalFieldErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        } else {
          setLocalFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }, 300),
    [validateField]
  );

  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply immediate and debounced validation
    debouncedValidation(name, value);

    handleInputChange(e);
  };

  const handleBasicInfoSubmit = (e) => {
    e.preventDefault();

    // Run a final validation before submission
    const nameError = validateField("name", localFormData.name);
    const phoneError = validateField("phone", localFormData.phone || "");

    const newErrors = {};
    if (nameError) newErrors.name = nameError;
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setLocalFieldErrors(newErrors);
      return;
    }

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
    setInitialFormData({ ...localFormData });
  };

  const handleCancel = () => {
    setIsEditingBasicInfo(false);
    // Reset to the initial data when cancel is clicked
    setLocalFormData({ ...initialFormData });
    setLocalFieldErrors({});
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);

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
            error={localFieldErrors}
            disabled={isSubmitting}
            containerClassName="profile-form-group"
            labelClassName="profile-form-label"
            className={
              localFieldErrors?.name
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
            required={true}
            error={localFieldErrors}
            disabled={isSubmitting}
            containerClassName="profile-form-group"
            labelClassName="profile-form-label"
            className={
              localFieldErrors?.phone
                ? "profile-form-input error"
                : "profile-form-input"
            }
            placeholder="e.g., +1 (555) 123-4567"
          />

          <div className="profile-form-actions">
            <FormSubmitButton
              size="small"
              type="submit"
              text={isSubmitting ? "Saving..." : "Save Changes"}
              disabled={!isBasicInfoValid || isSubmitting}
              aria-label="Save basic information changes"
            />
            <FormSubmitButton
              size="small"
              type="button"
              variant="outline"
              text="Cancel"
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

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FormInputField, FormSubmitButton } from "../../../components/form";
import { debounce } from "lodash";
import { validateAddress } from "../../../utils/validation";
import { COUNTRIES } from "../../../utils/validationSchemas";
import "./ShippingAddressSection.css";

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
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [localFieldErrors, setLocalFieldErrors] = useState({});
  const [initialFormData, setInitialFormData] = useState({
    address: {},
  });

  // Set initial form data and errors when editing is toggled
  useEffect(() => {
    if (!isEditingAddress) {
      setLocalFormData({
        address: { ...formData.address },
      });
      setInitialFormData({
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
    const criticalAddressFields = ["street", "city", "zipCode", "country"];
    const hasAllCriticalFields = criticalAddressFields.every(
      (field) =>
        localFormData.address[field] &&
        localFormData.address[field].trim() !== ""
    );

    // Check if there are any address field errors
    const hasAddressErrors =
      localFieldErrors?.address &&
      Object.keys(localFieldErrors.address).some(
        (key) => localFieldErrors.address[key]
      );

    setIsAddressValid(hasAllCriticalFields && !hasAddressErrors);

    // Update local field errors from parent
    if (fieldErrors && !isEditingAddress) {
      setLocalFieldErrors(fieldErrors);
    }
  }, [localFormData, fieldErrors, localFieldErrors, isEditingAddress]);

  // Function to validate a single address field
  const validateField = useCallback(
    (name, value) => {
      const field = name.split(".")[1];

      // If no address fields are filled, no validation needed
      const hasAnyAddressField = Object.keys(localFormData.address).some(
        (field) =>
          localFormData.address[field] &&
          localFormData.address[field].trim() !== ""
      );

      if (!hasAnyAddressField) {
        return null;
      }

      // Create a temporary address object with just this field for validation
      const tempAddress = {
        ...localFormData.address,
        [field]: value,
      };

      // Use the validation utility to validate this field
      const addressErrors = validateAddress(tempAddress);

      // Return the error for the specific field if it exists
      return addressErrors[field] || null;
    },
    [localFormData]
  );

  // Function to validate all address fields at once
  const validateAddressFields = useCallback(() => {
    const hasAnyAddressField = Object.keys(localFormData.address).some(
      (field) =>
        localFormData.address[field] &&
        localFormData.address[field].trim() !== ""
    );

    if (!hasAnyAddressField) {
      // If no address is provided, clear validation errors
      setLocalFieldErrors((prev) => ({
        ...prev,
        address: undefined,
      }));
      return;
    }

    // Use the validation utility to validate the entire address
    const addressErrors = validateAddress(localFormData.address);

    // Only update if there are errors
    if (Object.keys(addressErrors).length > 0) {
      setLocalFieldErrors((prev) => ({
        ...prev,
        address: addressErrors,
      }));
    } else {
      setLocalFieldErrors((prev) => ({
        ...prev,
        address: undefined,
      }));
    }
  }, [localFormData]);

  // Immediately validate fields when editing starts
  useEffect(() => {
    if (isEditingAddress) {
      validateAddressFields();
    }
  }, [isEditingAddress, validateAddressFields]);

  // Debounced validation function
  const debouncedValidation = useMemo(
    () =>
      debounce((name, value) => {
        const error = validateField(name, value);
        const fieldName = name.split(".")[1];

        if (error) {
          setLocalFieldErrors((prev) => ({
            ...prev,
            address: {
              ...(prev.address || {}),
              [fieldName]: error,
            },
          }));
        } else {
          setLocalFieldErrors((prev) => {
            // If there's no address errors, don't create an empty object
            if (!prev.address) return prev;

            const newAddressErrors = { ...prev.address };
            delete newAddressErrors[fieldName];

            return {
              ...prev,
              address:
                Object.keys(newAddressErrors).length > 0
                  ? newAddressErrors
                  : undefined,
            };
          });
        }

        // Run complete validation to check all fields
        validateAddressFields();
      }, 300),
    [validateField, validateAddressFields]
  );

  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setLocalFormData((prev) => {
        const updatedData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
        return updatedData;
      });

      // Apply debounced validation for this field
      debouncedValidation(name, value);
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
      setInitialFormData({
        address: { ...emptyAddress.address },
      });
      return;
    }

    // Run final validation on all fields
    validateAddressFields();

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
    setInitialFormData({
      address: { ...localFormData.address },
    });
  };

  const handleCancel = () => {
    setIsEditingAddress(false);
    // Reset to initial form data
    setLocalFormData({
      address: { ...initialFormData.address },
    });

    // Also reset the parent form data to ensure UI consistency
    if (handleInputChange) {
      // Create synthetic events for each address field to update the parent state
      Object.keys(initialFormData.address).forEach((key) => {
        const syntheticEvent = {
          target: {
            name: `address.${key}`,
            value: initialFormData.address[key] || "",
          },
        };
        handleInputChange(syntheticEvent);
      });
    }

    setLocalFieldErrors({});
  };

  // Get country name from code for display
  const getCountryNameByCode = (code) => {
    if (!code) return "";
    const country = COUNTRIES.find((c) => c.code === code);
    return country ? country.name : code;
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);

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
        <form
          onSubmit={handleAddressSubmit}
          noValidate
          className="compact-address-form"
        >
          <div className="profile-form-group">
            <FormInputField
              type="text"
              name="address.street"
              value={localFormData.address.street}
              onChange={handleLocalInputChange}
              label="Street Address"
              required
              error={localFieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                localFieldErrors?.address?.street
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />
          </div>

          <div className="profile-compact-row">
            <FormInputField
              type="text"
              name="address.city"
              value={localFormData.address.city}
              onChange={handleLocalInputChange}
              label="City"
              required
              error={localFieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                localFieldErrors?.address?.city
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
              error={localFieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                localFieldErrors?.address?.state
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />

            <FormInputField
              type="text"
              name="address.zipCode"
              value={localFormData.address.zipCode}
              onChange={handleLocalInputChange}
              label="Zip/Postal Code"
              required
              error={localFieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                localFieldErrors?.address?.zipCode
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
            />
          </div>

          <div className="profile-form-group">
            <FormInputField
              type="select"
              name="address.country"
              value={localFormData.address.country}
              onChange={handleLocalInputChange}
              label="Country"
              required
              error={localFieldErrors}
              disabled={isSubmitting}
              containerClassName="profile-form-group"
              labelClassName="profile-form-label"
              className={
                localFieldErrors?.address?.country
                  ? "profile-form-input error"
                  : "profile-form-input"
              }
              options={COUNTRIES}
              placeholder="Select a country"
            />
          </div>

          <div className="profile-form-actions">
            <FormSubmitButton
              size="small"
              type="submit"
              text={isSubmitting ? "Saving..." : "Save Changes"}
              disabled={!isAddressValid || isSubmitting}
              aria-label="Save address changes"
            />
            <FormSubmitButton
              size="small"
              type="button"
              variant="secondary"
              text="Cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel address editing"
            />
          </div>
        </form>
      ) : (
        <div className="profile-address-container">
          {Object.values(formData.address).some(
            (val) => val && val.trim() !== ""
          ) ? (
            <div className="profile-address-details">
              <p className="profile-address-text">
                {formData.address.street && (
                  <span className="profile-address-line">
                    {formData.address.street}
                  </span>
                )}
                {(formData.address.city ||
                  formData.address.state ||
                  formData.address.zipCode) && (
                  <span className="profile-address-line">
                    {formData.address.city &&
                      `${formData.address.city}${
                        formData.address.state ? ", " : ""
                      }`}
                    {formData.address.state}
                    {formData.address.zipCode && ` ${formData.address.zipCode}`}
                  </span>
                )}
                {formData.address.country && (
                  <span className="profile-address-line">
                    {getCountryNameByCode(formData.address.country)}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="profile-no-data">No address information provided</p>
          )}
        </div>
      )}
    </section>
  );
};

export default ShippingAddressSection;

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../redux/slices/userSlice";
import { validateForm } from "../../../utils/validation";
import {
  profileBasicInfoSchema,
  profileAddressSchema,
} from "../../../utils/validationSchemas";
import { debounce } from "lodash";

const useProfileForm = (user, showSuccess, showError) => {
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      const newFormData = {
        name: user.username || user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      };

      setFormData(newFormData);
    }
  }, [user]); // Changed to depend only on user

  // Validate entire form
  const validateFormData = useCallback(() => {
    // Validate basic info
    const basicInfoErrors = validateForm(formData, profileBasicInfoSchema);

    // Validate address fields if any are filled
    const hasAddressData = Object.values(formData.address).some(
      (val) => val && val.trim() !== ""
    );

    if (hasAddressData) {
      const addressErrors = validateForm(
        { address: formData.address },
        profileAddressSchema
      );

      const newErrors = {
        ...basicInfoErrors,
        ...addressErrors,
      };

      // Only update errors if they've changed
      if (JSON.stringify(fieldErrors) !== JSON.stringify(newErrors)) {
        setFieldErrors(newErrors);
      }

      return newErrors;
    } else {
      if (JSON.stringify(fieldErrors) !== JSON.stringify(basicInfoErrors)) {
        setFieldErrors(basicInfoErrors);
      }
      return basicInfoErrors;
    }
  }, [formData, fieldErrors]);

  // Debounced validation
  const debouncedValidation = useMemo(
    () => debounce(validateFormData, 300),
    [validateFormData]
  );

  // Input change handler with debounced validation
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const newData = name.includes(".")
          ? {
              ...prev,
              address: {
                ...prev.address,
                [name.split(".")[1]]: value,
              },
            }
          : {
              ...prev,
              [name]: value,
            };

        // Trigger debounced validation
        debouncedValidation();

        return newData;
      });
    },
    [debouncedValidation]
  );

  // Form submission
  const handleSubmit = useCallback(
    async (e, customFormData = null) => {
      e?.preventDefault();

      // If customFormData is provided (for section updates), merge it with existing data
      // to ensure we don't lose data from other sections when updating partially
      const dataToSubmit = customFormData
        ? {
            // Start with the current full form data
            ...formData,
            // Then overlay with the section-specific changes
            ...customFormData,
            // For address, we need to merge separately to avoid overwriting the entire address object
            address: customFormData.address
              ? {
                  ...formData.address,
                  ...customFormData.address,
                }
              : formData.address,
          }
        : formData;

      // Validate the form data that will be submitted
      const validationErrors = validateForm(dataToSubmit, {
        ...profileBasicInfoSchema,
        address: profileAddressSchema.address,
      });

      if (Object.keys(validationErrors).length > 0) {
        showError("Please fix the errors in the form before submitting.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await dispatch(updateUserProfile(dataToSubmit)).unwrap();

        // Update the form data with the server response to keep everything in sync
        if (result) {
          setFormData({
            name: result.name || "",
            phone: result.phone || "",
            address: {
              street: result.address?.street || "",
              city: result.address?.city || "",
              state: result.address?.state || "",
              zipCode: result.address?.zipCode || "",
              country: result.address?.country || "",
            },
          });
          setUpdatedUserData(result);
        }

        showSuccess("Profile updated successfully!");
      } catch (error) {
        showError(error.message || "Failed to update profile");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateFormData, dispatch, showError, showSuccess]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);

  return {
    formData,
    setFormData,
    fieldErrors,
    isSubmitting,
    updatedUserData,
    handleInputChange,
    handleSubmit,
    validateFormData,
  };
};

export default useProfileForm;

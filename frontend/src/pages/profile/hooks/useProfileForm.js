import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../redux/slices/userSlice";
import { validateForm } from "../../../utils/validation";
import {
  profileBasicInfoSchema,
  profileAddressSchema,
} from "../../../utils/validationSchemas";

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

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  // Validate the form data
  const validateFormData = useCallback(
    (dataToValidate = formData) => {
      // Validate basic info (name and phone)
      const basicInfoErrors = validateForm(
        dataToValidate,
        profileBasicInfoSchema
      );

      // If address has any data, validate it
      const hasAddressData = Object.values(dataToValidate.address || {}).some(
        (val) => val && val.trim() !== ""
      );

      if (hasAddressData) {
        const addressErrors = validateForm(
          { address: dataToValidate.address },
          profileAddressSchema
        );

        const newErrors = { ...basicInfoErrors, ...addressErrors };
        setFieldErrors(newErrors);
        return newErrors;
      } else {
        setFieldErrors(basicInfoErrors);
        return basicInfoErrors;
      }
    },
    [formData]
  );

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // Handle address fields (which have dot notation)
      if (name.includes(".")) {
        const [parent, field] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [field]: value,
          },
        };
      }
      // Handle regular fields
      else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e, customFormData = null) => {
      e?.preventDefault();

      // If updating a specific section, merge it with existing data
      const dataToSubmit = customFormData
        ? {
            ...formData,
            ...customFormData,
            // Handle address separately to properly merge
            address: customFormData.address
              ? { ...formData.address, ...customFormData.address }
              : formData.address,
          }
        : formData;

      // Validate before submitting
      const errors = validateFormData(dataToSubmit);
      if (Object.keys(errors).length > 0) {
        showError("Please fix the errors in the form before submitting.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await dispatch(updateUserProfile(dataToSubmit)).unwrap();

        // Update form with response data to ensure consistency
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

  return {
    formData,
    setFormData,
    fieldErrors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    validateFormData,
  };
};

export default useProfileForm;

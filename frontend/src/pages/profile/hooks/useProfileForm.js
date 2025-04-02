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
  const [updatedUserData, setUpdatedUserData] = useState(null);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || user.name || "",
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

      // Update field errors state
      setFieldErrors({
        ...basicInfoErrors,
        ...addressErrors,
      });

      return { ...basicInfoErrors, ...addressErrors };
    } else {
      setFieldErrors(basicInfoErrors);
      return basicInfoErrors;
    }
  }, [formData]);

  // Initial validation after form data is populated
  useEffect(() => {
    if (formData.name) {
      validateFormData();
    }
  }, [formData, validateFormData]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e, customFormData = null) => {
    e?.preventDefault();

    const dataToSubmit = customFormData || formData;
    const validationErrors = validateFormData();

    if (Object.keys(validationErrors).length > 0) {
      showError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(updateUserProfile(dataToSubmit)).unwrap();
      setUpdatedUserData(result);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      showError(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

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

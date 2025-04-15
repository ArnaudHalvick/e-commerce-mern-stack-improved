import { useState, useCallback } from "react";
import { validateForm, isFormValid } from "../../../utils/validation";
import useFormErrors from "../../../hooks/useFormErrors";

/**
 * Custom hook for common form handling logic
 *
 * @param {Object} initialFormData - Initial form data state
 * @param {Object} validationRules - Validation rules for the form
 * @param {Function} validateField - Function to validate individual fields
 * @returns {Object} Form state and handlers
 */
const useFormHandler = (initialFormData, validationRules, validateField) => {
  const {
    errors: formErrors,
    clearAllErrors: clearFormError,
    handleApiError: setFormError,
  } = useFormErrors();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Validate the entire form
   */
  const validateFormData = useCallback(() => {
    const errors = validateForm(formData, validationRules);
    setFieldErrors(errors);
    return isFormValid(errors);
  }, [formData, validationRules]);

  /**
   * Handle input changes
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear any form-level errors when user starts typing
      if (formErrors.general) {
        clearFormError();
      }
    },
    [formErrors, clearFormError]
  );

  /**
   * Handle blur event (validate field on blur)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      validateField(name, value);
    },
    [validateField]
  );

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    fieldErrors,
    setFieldErrors,
    formErrors,
    clearFormError,
    setFormError,
    handleChange,
    handleBlur,
    validateFormData,
  };
};

export default useFormHandler;

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
  // Track which fields have been touched or blurred
  const [touchedFields, setTouchedFields] = useState({});

  /**
   * Validate the entire form
   */
  const validateFormData = useCallback(() => {
    // Mark all fields as touched when validating the whole form
    const allFieldsTouched = Object.keys(validationRules).reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {}
    );
    setTouchedFields(allFieldsTouched);

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

      // Mark field as touched when user interacts with it
      if (!touchedFields[name]) {
        setTouchedFields((prev) => ({ ...prev, [name]: true }));
      }

      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear any form-level errors when user starts typing
      if (formErrors.general) {
        clearFormError();
      }

      // Validate field on change if it's already been touched
      if (touchedFields[name]) {
        validateField(name, value);
      }
    },
    [formErrors, clearFormError, validateField, touchedFields]
  );

  /**
   * Handle blur event (validate field on blur)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Mark field as touched when it loses focus
      setTouchedFields((prev) => ({ ...prev, [name]: true }));

      // Always validate on blur
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
    touchedFields,
  };
};

export default useFormHandler;

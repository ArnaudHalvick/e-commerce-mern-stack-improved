import { useState } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";

const useFormValidation = (
  validateForm,
  prepareFormDataForSubmission,
  onSave,
  resetImageUpload
) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData = prepareFormDataForSubmission();
      await onSave(updatedData);

      // After successful save, clear the newly uploaded images array
      resetImageUpload();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast({
        type: "error",
        message: `Failed to save product: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
};

export default useFormValidation;

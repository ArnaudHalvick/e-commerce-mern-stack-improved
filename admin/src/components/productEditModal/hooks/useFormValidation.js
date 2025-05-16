import { useState, useCallback } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

const useFormValidation = (
  validateForm,
  prepareFormDataForSubmission,
  onSave,
  resetImageUpload
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showErrorToast, showSuccessToast } = useToast();

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Enhanced validation debugging
      const isValid = validateForm();
      if (!isValid) {
        showErrorToast("Please fix all required fields highlighted in red");
        return;
      }

      setIsSubmitting(true);

      try {
        const preparedData = prepareFormDataForSubmission();
        let result;

        // Improved logic to determine create vs update
        // We prioritize the presence of an ID over the isNewProduct flag
        if (!preparedData._id) {
          // No ID means we need to create a new product
          result = await productsService.createProduct(preparedData);
        } else {
          // Having an ID means we're updating an existing product
          const productName = preparedData.name || "Product";

          result = await productsService.updateProduct(
            preparedData._id,
            preparedData
          );

          showSuccessToast(
            `Product "${result?.name || productName}" updated successfully`
          );
        }

        // Reset any image upload tracking
        if (resetImageUpload) {
          resetImageUpload();
        }

        // Package result in a consistent format
        const formattedResult = {
          success: true,
          data: result,
        };

        // Call the parent component's save handler with formatted result
        if (onSave) {
          onSave(formattedResult);
        }

        return formattedResult;
      } catch (error) {
        showErrorToast(`Failed to save product: ${error.message}`);
        return { success: false, error };
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      prepareFormDataForSubmission,
      onSave,
      resetImageUpload,
      showSuccessToast,
      showErrorToast,
    ]
  );

  return {
    isSubmitting,
    handleSubmit,
  };
};

export default useFormValidation;

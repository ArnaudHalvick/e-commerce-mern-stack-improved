import { useState, useCallback } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

const useFormValidation = (
  validateForm,
  prepareFormDataForSubmission,
  onSave,
  resetImageUpload,
  isNewProduct
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        showToast({
          type: "error",
          message: "Please fix the form errors before submitting",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const preparedData = prepareFormDataForSubmission();

        let result;

        // Determine whether to create or update the product
        if (isNewProduct) {
          // Create new product
          result = await productsService.createProduct(preparedData);
          showToast({
            type: "success",
            message: `Product "${result.name}" created successfully`,
          });
        } else {
          // Update existing product
          result = await productsService.updateProduct(
            preparedData._id,
            preparedData
          );
          showToast({
            type: "success",
            message: `Product "${result.name}" updated successfully`,
          });
        }

        // Reset any image upload tracking
        if (resetImageUpload) {
          resetImageUpload();
        }

        // Call the parent component's save handler
        if (onSave) {
          onSave(result);
        }

        return result;
      } catch (error) {
        console.error("Error saving product:", error);
        showToast({
          type: "error",
          message: `Failed to save product: ${error.message}`,
        });
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      prepareFormDataForSubmission,
      onSave,
      resetImageUpload,
      isNewProduct,
      showToast,
    ]
  );

  return {
    isSubmitting,
    handleSubmit,
  };
};

export default useFormValidation;

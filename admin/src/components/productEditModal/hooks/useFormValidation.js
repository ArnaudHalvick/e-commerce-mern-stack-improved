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

        // Debug info for troubleshooting
        console.log("Form data prepared for submission:", {
          isNewProduct,
          hasId: !!preparedData._id,
          data: preparedData,
        });

        let result;

        // Determine whether to create or update the product based on _id
        if (!preparedData._id) {
          // No ID means we're creating a new product
          console.log("Creating new product");
          result = await productsService.createProduct(preparedData);
          showToast({
            type: "success",
            message: `Product "${result.name}" created successfully`,
          });
        } else {
          // Having an ID means we're updating an existing product
          console.log("Updating existing product with ID:", preparedData._id);
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

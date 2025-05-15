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
  const { showErrorToast, showSuccessToast } = useToast();

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      // Enhanced validation debugging
      const isValid = validateForm();
      if (!isValid) {
        console.log("Form validation failed with errors:", {
          fields: Object.keys(prepareFormDataForSubmission()),
          errors: Object.entries(prepareFormDataForSubmission())
            .filter(([key]) => !prepareFormDataForSubmission()[key])
            .map(([key]) => `${key} is empty`),
        });

        // Check for common validation failures and show specific messages
        const preparedData = prepareFormDataForSubmission();
        if (!preparedData.images || preparedData.images.length === 0) {
          showErrorToast("Please add at least one image");
        } else {
          showErrorToast("Please fix the form errors");
        }
        return;
      }

      setIsSubmitting(true);

      try {
        const preparedData = prepareFormDataForSubmission();

        // Better debug logging
        console.log("Form data prepared for submission:", {
          isNewProductFlag: isNewProduct,
          hasId: !!preparedData._id,
          productId: preparedData._id || "none",
          category: preparedData.category,
          name: preparedData.name,
          data: preparedData,
        });

        let result;

        // Improved logic to determine create vs update
        // We prioritize the presence of an ID over the isNewProduct flag
        if (!preparedData._id) {
          // No ID means we need to create a new product
          console.log("Creating new product - no ID present");

          // Create the product without showing toast (handled by ErrorState)
          result = await productsService.createProduct(preparedData);

          // Don't show toast here - let the ErrorState context handle it
          // to avoid duplicate messages
        } else {
          // Having an ID means we're updating an existing product
          console.log("Updating existing product with ID:", preparedData._id);

          // Save original product name in case the API response doesn't include it
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
          console.log(
            "Resetting image upload state after successful submission"
          );
          resetImageUpload();
        }

        // Package result in a consistent format
        const formattedResult = {
          success: true,
          data: result,
        };

        // Call the parent component's save handler with formatted result
        if (onSave) {
          console.log(
            "Calling onSave with formatted result and resetting form"
          );
          onSave(formattedResult);
        }

        return formattedResult;
      } catch (error) {
        console.error("Error saving product:", error);
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
      isNewProduct,
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

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

      // Enhanced validation debugging
      const isValid = validateForm();
      if (!isValid) {
        console.log("Form validation failed with errors:", {
          fields: Object.keys(prepareFormDataForSubmission()),
          errors: Object.entries(prepareFormDataForSubmission())
            .filter(([key]) => !prepareFormDataForSubmission()[key])
            .map(([key]) => `${key} is empty`),
        });

        showToast({
          type: "error",
          message: "Please fix the form errors before submitting",
        });
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

          // Save original product name in case the API response doesn't include it
          const productName = preparedData.name || "New product";

          result = await productsService.createProduct(preparedData);
          showToast({
            type: "success",
            message: `Product "${
              result?.name || productName
            }" created successfully`,
          });
        } else {
          // Having an ID means we're updating an existing product
          console.log("Updating existing product with ID:", preparedData._id);

          // Save original product name in case the API response doesn't include it
          const productName = preparedData.name || "Product";

          result = await productsService.updateProduct(
            preparedData._id,
            preparedData
          );
          showToast({
            type: "success",
            message: `Product "${
              result?.name || productName
            }" updated successfully`,
          });
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

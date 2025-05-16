import { useState, useCallback } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

/**
 * Shared hook for product management that can be used by both edit and add product screens
 */
const useProductManagement = ({ onProductUpdated, onProductCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showErrorToast, showSuccessToast } = useToast();

  // Open the modal for creating a new product
  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null); // Null indicates creating a new product
    setIsModalOpen(true);
  }, []);

  // Open the modal for editing an existing product
  const handleEditProduct = useCallback(
    (product) => {
      if (!product || !product._id) {
        showErrorToast("Cannot edit product: Invalid product data");
        return;
      }

      try {
        // Create a deep copy to avoid reference issues and ensure ID is preserved
        const productCopy = JSON.parse(JSON.stringify(product));

        // Double-check the ID is preserved
        if (!productCopy._id && product._id) {
          productCopy._id = product._id;
        }

        setSelectedProduct(productCopy);
        setIsModalOpen(true);
      } catch {
        showErrorToast("Error preparing product data for editing");
      }
    },
    [showErrorToast]
  );

  // Close the modal and ensure all fields are reset
  const handleCloseModal = useCallback(() => {
    // First close the modal
    setIsModalOpen(false);

    // Use a small delay to ensure animations complete before resetting state
    // This prevents visual glitches during modal close animation
    setTimeout(() => {
      // Reset selected product to null to trigger form reset in useProductForm
      setSelectedProduct(null);
    }, 300); // Short delay for modal close animation
  }, []);

  // Handle saving a product (either create or update)
  const handleSaveProduct = useCallback(
    async (productData) => {
      setIsLoading(true);

      // Check if productData is just the API response (with only success, data properties)
      // If it only contains API response properties, it's already been processed by useFormValidation
      if (
        productData &&
        productData.success &&
        productData.data &&
        Object.keys(productData).length <= 3
      ) {
        // Just handle the success callbacks
        if (!productData.data._id) {
          // It was a new product creation
          if (onProductCreated) {
            onProductCreated(productData.data);
          }
        } else {
          // It was a product update
          if (onProductUpdated) {
            onProductUpdated(productData.data);
          }
        }

        // Close modal and return
        handleCloseModal();
        setIsLoading(false);
        return productData;
      }

      // Ensure we have a proper copy to avoid modifications to the source
      const productToSave = JSON.parse(JSON.stringify(productData));

      // If we have a selected product with an ID but productData doesn't have one,
      // something went wrong, so let's fix it
      if (selectedProduct && selectedProduct._id && !productToSave._id) {
        productToSave._id = selectedProduct._id;
      }

      try {
        let result;

        // Determine whether to create or update based on presence of _id
        if (!productToSave._id) {
          // Create a new product - no ID means it's new
          result = await productsService.createProduct(productToSave);

          // Call the success callback if provided
          if (onProductCreated) {
            onProductCreated(result);
          }
        } else {
          // Update an existing product - has ID means it exists
          // Save the product name before sending to API in case response is incomplete
          const productName = productToSave.name || "Product";

          result = await productsService.updateProduct(
            productToSave._id,
            productToSave
          );

          // Use result name if available, otherwise fall back to the saved name
          const displayName = result?.name || productName || "Product";

          showSuccessToast(`Product "${displayName}" updated successfully`);

          // Call the success callback if provided
          if (onProductUpdated) {
            onProductUpdated(result || productToSave);
          }
        }

        // Close the modal
        handleCloseModal();
        return { success: true, data: result };
      } catch (error) {
        showErrorToast(`Failed to save product: ${error.message}`);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [
      showSuccessToast,
      showErrorToast,
      handleCloseModal,
      onProductCreated,
      onProductUpdated,
      selectedProduct,
    ]
  );

  // Handle deleting a product
  const handleDeleteProduct = useCallback(
    async (productId) => {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      setIsLoading(true);

      try {
        await productsService.deleteProduct(productId);
        showSuccessToast("Product deleted successfully");

        // Call the update callback to refresh the product list
        if (onProductUpdated) {
          onProductUpdated();
        }

        return true;
      } catch (error) {
        showErrorToast(`Failed to delete product: ${error.message}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccessToast, showErrorToast, onProductUpdated]
  );

  // Handle toggling product availability
  const handleToggleAvailability = useCallback(
    async (productId, currentStatus) => {
      setIsLoading(true);

      try {
        await productsService.toggleAvailability(productId, !currentStatus);
        showSuccessToast(
          `Product ${!currentStatus ? "activated" : "deactivated"} successfully`
        );

        // Call the update callback to refresh the product list
        if (onProductUpdated) {
          onProductUpdated();
        }

        return true;
      } catch (error) {
        showErrorToast(`Failed to update availability: ${error.message}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccessToast, showErrorToast, onProductUpdated]
  );

  return {
    isModalOpen,
    isLoading,
    selectedProduct,
    handleCreateProduct,
    handleEditProduct,
    handleCloseModal,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleAvailability,
  };
};

export default useProductManagement;

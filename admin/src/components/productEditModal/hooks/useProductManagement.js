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
  const { showToast } = useToast();

  // Open the modal for creating a new product
  const handleCreateProduct = useCallback(() => {
    setSelectedProduct(null); // Null indicates creating a new product
    setIsModalOpen(true);
  }, []);

  // Open the modal for editing an existing product
  const handleEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // Close the modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Handle saving a product (either create or update)
  const handleSaveProduct = useCallback(
    async (productData) => {
      setIsLoading(true);

      try {
        let result;

        // Determine whether to create or update
        if (!productData._id) {
          // Create a new product
          result = await productsService.createProduct(productData);
          showToast({
            type: "success",
            message: `Product "${result.name}" created successfully`,
          });

          // Call the success callback if provided
          if (onProductCreated) {
            onProductCreated(result);
          }
        } else {
          // Update an existing product
          result = await productsService.updateProduct(
            productData._id,
            productData
          );
          showToast({
            type: "success",
            message: `Product "${result.name}" updated successfully`,
          });

          // Call the success callback if provided
          if (onProductUpdated) {
            onProductUpdated(result);
          }
        }

        // Close the modal
        handleCloseModal();
        return result;
      } catch (error) {
        console.error("Error saving product:", error);
        showToast({
          type: "error",
          message: `Failed to save product: ${error.message}`,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, handleCloseModal, onProductCreated, onProductUpdated]
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
        showToast({
          type: "success",
          message: "Product deleted successfully",
        });

        // Call the update callback to refresh the product list
        if (onProductUpdated) {
          onProductUpdated();
        }

        return true;
      } catch (error) {
        console.error("Error deleting product:", error);
        showToast({
          type: "error",
          message: `Failed to delete product: ${error.message}`,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, onProductUpdated]
  );

  // Handle toggling product availability
  const handleToggleAvailability = useCallback(
    async (productId, currentStatus) => {
      setIsLoading(true);

      try {
        await productsService.toggleAvailability(productId, !currentStatus);
        showToast({
          type: "success",
          message: `Product ${
            !currentStatus ? "activated" : "deactivated"
          } successfully`,
        });

        // Call the update callback to refresh the product list
        if (onProductUpdated) {
          onProductUpdated();
        }

        return true;
      } catch (error) {
        console.error("Error toggling availability:", error);
        showToast({
          type: "error",
          message: `Failed to update availability: ${error.message}`,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, onProductUpdated]
  );

  return {
    isModalOpen,
    selectedProduct,
    isLoading,
    handleCreateProduct,
    handleEditProduct,
    handleCloseModal,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleAvailability,
  };
};

export default useProductManagement;

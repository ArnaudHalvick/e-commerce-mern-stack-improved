import { useState } from "react";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";

/**
 * Custom hook for managing product actions (edit, delete, toggle availability)
 * @param {Object} productOperations - Object containing product operations from useProductList
 * @returns {Object} Product action handlers and related state
 */
const useProductActions = ({
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  fetchProducts,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showToast } = useToast();

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct._id, updatedProduct);
      showToast({
        type: "success",
        message: "Product updated successfully",
      });
      handleModalClose();
      // Refresh the product list after update
      fetchProducts();
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to update product: ${error.message}`,
      });
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await toggleProductAvailability(productId, !currentStatus);
      showToast({
        type: "success",
        message: `Product ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`,
      });
      // Refresh the product list after toggling availability
      fetchProducts();
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to update product availability: ${error.message}`,
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(productId);
      showToast({
        type: "success",
        message: "Product deleted successfully",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to delete product: ${error.message}`,
      });
    }
  };

  return {
    isEditModalOpen,
    selectedProduct,
    handleEditClick,
    handleModalClose,
    handleSaveProduct,
    handleToggleAvailability,
    handleDeleteProduct,
  };
};

export default useProductActions;

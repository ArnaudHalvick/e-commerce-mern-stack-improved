import { useState, useCallback } from "react";
import { useProductManagement } from "../../../components/productEditModal";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

/**
 * Custom hook for managing product actions (edit, delete, toggle availability)
 * @param {Object} productFetchOperations - Object containing product operations from useProductList
 * @returns {Object} Product action handlers and related state
 */
const useProductActions = ({ fetchProducts }) => {
  const { showToast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the shared product management hook for consistent product operations
  const {
    isModalOpen: isEditModalOpen,
    selectedProduct,
    handleEditProduct: handleEditClick,
    handleCloseModal: handleModalClose,
    handleSaveProduct,
    handleToggleAvailability,
  } = useProductManagement({
    onProductUpdated: (updatedProduct) => {
      // Refresh the product list after any update
      console.log(
        "Product updated, refreshing list",
        updatedProduct?.name || "unnamed"
      );
      fetchProducts();
    },
  });

  // Ensure we have a valid product before editing
  const validateProduct = useCallback(
    (product) => {
      if (!product) {
        console.error("Cannot edit null product");
        showToast({
          type: "error",
          message: "Error: Cannot edit product (no product data)",
        });
        return false;
      }

      if (!product._id) {
        console.error("Product missing ID:", product);
        showToast({
          type: "error",
          message: "Error: Cannot edit product (missing ID)",
        });
        return false;
      }

      if (!product.name) {
        console.warn("Product missing name:", product._id);
      }

      return true;
    },
    [showToast]
  );

  // Custom edit handler to validate product first
  const handleProductEdit = useCallback(
    (product) => {
      console.log("Edit requested for product:", product?._id);

      if (validateProduct(product)) {
        // Make a deep copy of the product to avoid reference issues
        const productCopy = JSON.parse(JSON.stringify(product));

        // Ensure ID is present
        if (!productCopy._id && product._id) {
          productCopy._id = product._id;
        }

        console.log("Validated product for editing:", productCopy);

        // Now call the actual edit function
        handleEditClick(productCopy);
      }
    },
    [validateProduct, handleEditClick]
  );

  // Open delete confirmation modal
  const handleOpenDeleteModal = useCallback((product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }, []);

  // Close delete confirmation modal
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  // Confirm product deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete || !productToDelete._id) {
      showToast({
        type: "error",
        message: "Error: Cannot delete product (invalid product data)",
      });
      handleCloseDeleteModal();
      return;
    }

    setIsDeleting(true);

    try {
      await productsService.deleteProduct(productToDelete._id);
      showToast({
        type: "success",
        message: `Product "${productToDelete.name}" successfully deleted`,
      });

      // Refresh the product list
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast({
        type: "error",
        message: `Failed to delete product: ${
          error.message || "Unknown error"
        }`,
      });
    } finally {
      setIsDeleting(false);
      handleCloseDeleteModal();
    }
  }, [productToDelete, showToast, handleCloseDeleteModal, fetchProducts]);

  return {
    isEditModalOpen,
    selectedProduct,
    handleEditClick: handleProductEdit, // Use our validated version
    handleModalClose,
    handleSaveProduct,
    handleToggleAvailability,

    // Delete-related properties and methods
    isDeleteModalOpen,
    productToDelete,
    isDeleting,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
  };
};

export default useProductActions;

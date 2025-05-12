import { useCallback } from "react";
import { useProductManagement } from "../../../components/productEditModal";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";

/**
 * Custom hook for managing product actions (edit, delete, toggle availability)
 * @param {Object} productFetchOperations - Object containing product operations from useProductList
 * @returns {Object} Product action handlers and related state
 */
const useProductActions = ({ fetchProducts }) => {
  const { showToast } = useToast();

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
    [validateProduct]
  );

  // Use the shared product management hook for consistent product operations
  const {
    isModalOpen: isEditModalOpen,
    selectedProduct,
    handleEditProduct: handleEditClick,
    handleCloseModal: handleModalClose,
    handleSaveProduct,
    handleDeleteProduct,
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

  return {
    isEditModalOpen,
    selectedProduct,
    handleEditClick: handleProductEdit, // Use our validated version
    handleModalClose,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleAvailability,
  };
};

export default useProductActions;

import { useProductManagement } from "../../../components/productEditModal";

/**
 * Custom hook for managing product actions (edit, delete, toggle availability)
 * @param {Object} productFetchOperations - Object containing product operations from useProductList
 * @returns {Object} Product action handlers and related state
 */
const useProductActions = ({ fetchProducts }) => {
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
    onProductUpdated: () => {
      // Refresh the product list after any update
      fetchProducts();
    },
  });

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

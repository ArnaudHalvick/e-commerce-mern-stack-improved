import { useState, useCallback, useContext } from "react";
import { useProductManagement } from "../../../components/productEditModal";
import ErrorContext from "../../../context/error/ErrorContext";

/**
 * Custom hook for Add Product page functionality
 * Leverages the shared useProductManagement hook for consistent behavior
 *
 * @returns {Object} Hook methods and state
 */
const useAddProduct = () => {
  const [recentlyCreatedProduct, setRecentlyCreatedProduct] = useState(null);
  const errorContext = useContext(ErrorContext);

  // Use the shared product management hook
  const {
    isModalOpen,
    isLoading,
    handleCreateProduct,
    handleCloseModal,
    handleSaveProduct: originalHandleSaveProduct,
  } = useProductManagement({
    onProductCreated: (product) => {
      // Handle either raw product data or formatted response with data property
      const productData = product.data ? product.data : product;

      setRecentlyCreatedProduct(productData);
      // The toast message will be shown in ErrorState context, no need for duplicates
    },
  });

  // Custom save handler to show only one success toast
  const handleSaveProduct = useCallback(
    async (productData) => {
      try {
        // Clear any existing errors first
        errorContext.clearError();
        const result = await originalHandleSaveProduct(productData);

        // Show success message only once here
        if (result && result.success) {
          const productName = result.data?.name || productData.name;
          errorContext.setSuccess(
            `Product "${productName}" successfully created!`
          );
        }

        return result;
      } catch (error) {
        // Error handling is already managed by the hook and ErrorContext
        return { success: false, error };
      }
    },
    [originalHandleSaveProduct, errorContext]
  );

  // Handle opening the modal with error clearing
  const handleOpenModal = useCallback(() => {
    errorContext.clearError();
    handleCreateProduct();
  }, [handleCreateProduct, errorContext]);

  // Handle creating another product
  const handleCreateAnother = useCallback(() => {
    setRecentlyCreatedProduct(null);
    handleOpenModal();
  }, [handleOpenModal]);

  return {
    isModalOpen,
    isLoading,
    recentlyCreatedProduct,
    handleOpenModal,
    handleCloseModal,
    handleSaveProduct,
    handleCreateAnother,
  };
};

export default useAddProduct;

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
    handleSaveProduct,
  } = useProductManagement({
    onProductCreated: (product) => {
      // Handle either raw product data or formatted response with data property
      const productData = product.data ? product.data : product;

      setRecentlyCreatedProduct(productData);
      errorContext.setSuccess(
        `Product "${productData.name}" successfully created!`,
        productData
      );
    },
  });

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

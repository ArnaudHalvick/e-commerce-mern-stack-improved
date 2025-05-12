import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Use the shared product management hook
  const {
    isModalOpen,
    isLoading,
    handleCreateProduct,
    handleCloseModal,
    handleSaveProduct,
  } = useProductManagement({
    onProductCreated: (product) => {
      setRecentlyCreatedProduct(product);
      errorContext.setSuccess(
        `Product "${product.name}" successfully created!`,
        product
      );
    },
  });

  // Handle opening the modal with error clearing
  const handleOpenModal = useCallback(() => {
    errorContext.clearError();
    handleCreateProduct();
  }, [handleCreateProduct, errorContext]);

  // Handle viewing a newly created product
  const handleViewProduct = useCallback(() => {
    if (recentlyCreatedProduct && recentlyCreatedProduct._id) {
      navigate(`/admin/products/${recentlyCreatedProduct._id}`);
    }
  }, [navigate, recentlyCreatedProduct]);

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
    handleViewProduct,
    handleCreateAnother,
  };
};

export default useAddProduct;

import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useProductManagement } from "../../../components/productEditModal";
import ErrorContext from "../../../context/error/ErrorContext";

/**
 * Custom hook for Add Product page functionality
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
    handleCreateProduct: openModal,
    handleCloseModal,
    handleSaveProduct: saveProduct,
  } = useProductManagement({
    onProductCreated: (product) => {
      setRecentlyCreatedProduct(product);
      errorContext.setSuccess(
        `Product "${product.name}" successfully created!`,
        product
      );
    },
  });

  // New product template with default values
  const newProductTemplate = null; // Using null tells the modal to use default values

  // Handle opening the modal
  const handleOpenModal = useCallback(() => {
    errorContext.clearErrors();
    openModal();
  }, [openModal, errorContext]);

  // Handle saving a product
  const handleSaveProduct = useCallback(
    async (productData) => {
      errorContext.setLoading("addProduct");

      try {
        const result = await saveProduct(productData);
        return result;
      } catch (error) {
        errorContext.handleApiError(error, "Failed to create product");
        return null;
      } finally {
        errorContext.clearLoading("addProduct");
      }
    },
    [saveProduct, errorContext]
  );

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
    newProductTemplate,
    handleOpenModal,
    handleCloseModal,
    handleSaveProduct,
    handleViewProduct,
    handleCreateAnother,
  };
};

export default useAddProduct;

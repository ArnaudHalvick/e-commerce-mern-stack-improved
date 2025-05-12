import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";
import ErrorContext from "../../../context/error/ErrorContext";
import productsService from "../../../api/services/products";

/**
 * Custom hook for Add Product page functionality
 *
 * @returns {Object} Hook methods and state
 */
const useAddProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyCreatedProduct, setRecentlyCreatedProduct] = useState(null);
  const { showToast } = useToast();
  const errorContext = useContext(ErrorContext);
  const navigate = useNavigate();

  // Empty product template with default values
  const newProductTemplate = {
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    new_price: 0,
    old_price: 0,
    available: true,
    sizes: [],
    tags: [],
    types: [],
    images: [],
    mainImageIndex: 0,
  };

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSaveProduct = useCallback(
    async (productData) => {
      setIsLoading(true);
      errorContext.setLoading("addProduct");

      try {
        const result = await productsService.createProduct(productData);

        showToast({
          type: "success",
          message: `Product "${result.name}" successfully created!`,
        });

        errorContext.setSuccess(
          `Product "${result.name}" successfully created!`,
          result
        );
        setRecentlyCreatedProduct(result);
        handleCloseModal();
        return result;
      } catch (error) {
        errorContext.handleApiError(error, "Failed to create product");
        return null;
      } finally {
        setIsLoading(false);
        errorContext.clearLoading("addProduct");
      }
    },
    [errorContext, showToast, handleCloseModal]
  );

  const handleViewProduct = useCallback(() => {
    if (recentlyCreatedProduct && recentlyCreatedProduct._id) {
      navigate(`/admin/products/${recentlyCreatedProduct._id}`);
    }
  }, [navigate, recentlyCreatedProduct]);

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

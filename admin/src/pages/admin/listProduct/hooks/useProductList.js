import { useState, useCallback } from "react";
import api from "../../../../api";

/**
 * Hook for managing product list operations
 *
 * @returns {Object} Product list operations and state
 */
export const useProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all products
   * @param {Object} options - Filter options
   */
  const fetchProducts = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.products.getAllProducts(options);
      setProducts(response.data || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   */
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      // Optimistically update the UI
      const optimisticProduct = { ...productData };
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, ...optimisticProduct }
            : product
        )
      );

      // Perform the actual API call
      const updatedProduct = await api.products.updateProduct(
        productId,
        productData
      );

      // Update with the confirmed data from the server
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, ...updatedProduct }
            : product
        )
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }, []);

  /**
   * Delete a product
   * @param {string} productId - Product ID
   */
  const deleteProduct = useCallback(async (productId) => {
    try {
      await api.products.deleteProduct(productId);

      // Remove product from state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }, []);

  /**
   * Toggle product availability
   * @param {string} productId - Product ID
   * @param {boolean} available - New availability status
   */
  const toggleProductAvailability = useCallback(
    async (productId, available) => {
      try {
        // Optimistically update the UI
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? { ...product, available } : product
          )
        );

        // Perform the actual API call
        const updatedProduct = await api.products.toggleAvailability(
          productId,
          available
        );

        // Update with the confirmed data from the server
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, ...updatedProduct }
              : product
          )
        );

        return updatedProduct;
      } catch (error) {
        console.error("Error toggling product availability:", error);

        // Revert the optimistic update if the API call fails
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, available: !available }
              : product
          )
        );

        throw error;
      }
    },
    []
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
  };
};

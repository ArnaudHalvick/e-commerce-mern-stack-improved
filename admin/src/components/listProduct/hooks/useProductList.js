import { useState, useCallback } from "react";
import api from "../../../api";

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
      const data = await api.products.getAllProducts(options);
      setProducts(data.products || []);
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
      const updatedProduct = await api.products.updateProduct(
        productId,
        productData
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? updatedProduct : product
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
        const updatedProduct = await api.products.toggleAvailability(
          productId,
          available
        );

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? updatedProduct : product
          )
        );

        return updatedProduct;
      } catch (error) {
        console.error("Error toggling product availability:", error);
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

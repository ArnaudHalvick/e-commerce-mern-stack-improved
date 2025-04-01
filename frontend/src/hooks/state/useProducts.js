import { useState, useEffect, useCallback } from "react";
import { productsService } from "../../api";

/**
 * Custom hook for product data management
 * Provides access to product catalog and related operations
 */
const useProducts = () => {
  // State for product data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Fetch all products from the API
   * @returns {Promise<Array>} - List of products
   */
  const fetchProducts = useCallback(async () => {
    // Don't fetch if we already have products or are currently loading
    if (products.length > 0 || loading) return products;

    setLoading(true);
    setError(null);

    try {
      // Use the productsService to get all products
      const response = await productsService.getAllProducts();

      // Handle API response
      if (Array.isArray(response)) {
        setProducts(response);
        setIsInitialized(true);
        return response;
      } else {
        console.error("Invalid product data received:", response);
        setError("Failed to load products. Please try again later.");
        return [];
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [products, loading]);

  /**
   * Get a product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} - Product object or null if not found
   */
  const getProductById = useCallback(
    async (id) => {
      // Check if we already have this product in state
      const existingProduct = products.find((product) => product._id === id);
      if (existingProduct) return existingProduct;

      // If not, fetch it from the API
      try {
        const product = await productsService.getProductById(id);
        return product;
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
        return null;
      }
    },
    [products]
  );

  /**
   * Get products by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} - List of products in the category
   */
  const getProductsByCategory = useCallback(async (category) => {
    try {
      const categoryProducts = await productsService.getProductsByCategory(
        category
      );
      return categoryProducts;
    } catch (err) {
      console.error("Error fetching category products:", err);
      setError(`Failed to load ${category} products. Please try again later.`);
      return [];
    }
  }, []);

  /**
   * Get featured or new products
   * @param {string} type - Product type (featured, new, etc.)
   * @returns {Promise<Array>} - List of featured products
   */
  const getFeaturedProducts = useCallback(async (type = "featured") => {
    try {
      let featuredProducts;

      if (type === "new") {
        featuredProducts = await productsService.getNewCollection();
      } else if (type === "women") {
        featuredProducts = await productsService.getFeaturedWomen();
      } else {
        // Default to featured products
        featuredProducts = await productsService.getFeaturedProducts();
      }

      return featuredProducts;
    } catch (err) {
      console.error(`Error fetching ${type} products:`, err);
      setError(`Failed to load ${type} products. Please try again later.`);
      return [];
    }
  }, []);

  return {
    // State
    products,
    loading,
    error,
    isInitialized,

    // Methods
    fetchProducts,
    getProductById,
    getProductsByCategory,
    getFeaturedProducts,
  };
};

export default useProducts;

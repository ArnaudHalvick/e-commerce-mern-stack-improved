// Path: frontend/src/context/ShopContext.jsx
import React, { createContext, useState, useCallback } from "react";
import { productsService } from "../api";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create a function to fetch products that can be called when needed
  const fetchProducts = useCallback(async () => {
    // Don't fetch if we already have products or are currently loading
    if (all_product.length > 0 || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Use the productsService to get all products
      const response = await productsService.getAllProducts();

      // Handle API response which is a direct array, not an object with a data property
      if (Array.isArray(response)) {
        setAll_Product(response);
        setIsInitialized(true);
      } else {
        console.error("Invalid product data received:", response);
        setError("Failed to load products. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [all_product.length, loading]);

  const ctxValue = {
    all_product,
    loading,
    error,
    isInitialized,
    fetchProducts, // Expose the fetchProducts function to consumers
  };

  return (
    <ShopContext.Provider value={ctxValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

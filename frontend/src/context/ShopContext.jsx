// Path: frontend/src/context/ShopContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { productsService } from "../api";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the productsService to get all products
        const response = await productsService.getAllProducts();

        // Handle API response which is a direct array, not an object with a data property
        if (Array.isArray(response)) {
          setAll_Product(response);
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
    };

    fetchProducts();
  }, []);

  const ctxValue = {
    all_product,
    loading,
    error,
  };

  return (
    <ShopContext.Provider value={ctxValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;

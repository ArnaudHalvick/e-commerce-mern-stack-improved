// Path: frontend/src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products
  useEffect(() => {
    // Reset states when starting a fetch
    setLoading(true);
    setError(null);

    // Fetch all products
    fetch("http://localhost:4000/api/all-products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        // Validate data
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          setAll_Product([]);
        } else {
          setAll_Product(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
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

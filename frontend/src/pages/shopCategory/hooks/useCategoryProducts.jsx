import { useState, useEffect } from "react";

/**
 * Custom hook for fetching products by category
 *
 * @param {String} category - Category name to fetch products for
 * @returns {Object} Products data, loading state and error
 */
const useCategoryProducts = (category) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Use the new API endpoint that filters by category on the server
    fetch(
      `http://localhost:4000/api/products/category/${category}?basicInfo=true`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          setProducts([]);
        } else {
          // No need to filter as the API already returns the correct category
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  return { products, loading, error };
};

export default useCategoryProducts;

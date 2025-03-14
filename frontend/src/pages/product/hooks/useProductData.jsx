import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../../context/ShopContext";
import { API_BASE_URL } from "../../../utils/imageUtils";

/**
 * Custom hook for fetching product data
 *
 * @param {String} productId - Product ID to fetch
 * @param {String} productSlug - Product slug to fetch
 * @returns {Object} Product data, loading state and error
 */
const useProductData = (productId, productSlug) => {
  const {
    all_product,
    loading: contextLoading,
    error: contextError,
  } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only try to find product when context is loaded
    if (!contextLoading) {
      // If we have a product slug, we can directly fetch the detailed product
      if (productSlug) {
        setLoading(true);
        // Use the correct endpoint URL: /api/product/slug/:slug
        fetch(
          `${API_BASE_URL}/api/product/slug/${productSlug}?includeReviews=true`
        )
          .then((res) => {
            if (!res.ok) {
              throw new Error(
                `Failed to fetch product: ${res.status} ${res.statusText}`
              );
            }
            return res.json();
          })
          .then((data) => {
            setProduct(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching product by slug:", err);

            // If we couldn't fetch by slug, try to find the product in all_product context
            if (all_product && all_product.length > 0) {
              const contextProduct = all_product.find(
                (p) => p.slug === productSlug
              );
              if (contextProduct) {
                setProduct(contextProduct);
                setError(null);
              } else {
                setError(err.message);
              }
            } else {
              setError(err.message);
            }

            setLoading(false);
          });
      }
      // If we have a product ID, fetch by ID
      else if (productId) {
        setLoading(true);
        // The product ID endpoint is correct: /api/product/:id
        fetch(`${API_BASE_URL}/api/product/${productId}?includeReviews=true`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(
                `Failed to fetch product: ${res.status} ${res.statusText}`
              );
            }
            return res.json();
          })
          .then((data) => {
            // If product has a slug, redirect to the slug URL for better SEO
            if (data.slug) {
              navigate(`/products/${data.slug}`, { replace: true });
              return;
            }
            setProduct(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching product by ID:", err);

            // If we couldn't fetch by ID, try to find the product in all_product context
            if (all_product && all_product.length > 0) {
              const contextProduct = all_product.find(
                (p) => p.id === parseInt(productId) || p._id === productId
              );

              if (contextProduct) {
                setProduct(contextProduct);
                setError(null);
              } else {
                setError(err.message);
              }
            } else {
              setError(err.message);
            }

            setLoading(false);
          });
      }
      // If no slug or ID, use context to find product (less common case)
      else if (all_product && all_product.length > 0) {
        setLoading(false);
        setError("No product identifier provided");
      }
    }
  }, [productId, productSlug, navigate, contextLoading, all_product]);

  return {
    product,
    loading: contextLoading || loading,
    error: contextError || error,
  };
};

export default useProductData;

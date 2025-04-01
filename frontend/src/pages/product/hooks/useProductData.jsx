import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/state";
import { productsService } from "../../../api";

/**
 * Custom hook for fetching product data
 *
 * @param {String} productId - Product ID to fetch
 * @param {String} productSlug - Product slug to fetch
 * @returns {Object} Product data, loading state and error
 */
const useProductData = (productId, productSlug) => {
  const {
    products: all_product,
    loading: contextLoading,
    error: contextError,
    isInitialized,
    fetchProducts,
  } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // First, ensure products are loaded if we might need them
  useEffect(() => {
    // We'll fetch products in these cases:
    // 1. If we have a product ID or slug and might use context as fallback
    // 2. If we're relying on context exclusively (no ID or slug)
    if (!isInitialized && (productId || productSlug)) {
      fetchProducts();
    }
  }, [isInitialized, fetchProducts, productId, productSlug]);

  useEffect(() => {
    // Only try to find product when we're not waiting for context to load
    if (!contextLoading) {
      // If we have a product slug, we can directly fetch the detailed product
      if (productSlug) {
        setLoading(true);
        productsService
          .getProductBySlug(productSlug)
          .then((data) => {
            setProduct(data.product);
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
        productsService
          .getProductById(productId)
          .then((data) => {
            // If product has a slug, redirect to the slug URL for better SEO
            if (data.product && data.product.slug) {
              navigate(`/products/${data.product.slug}`, { replace: true });
              return;
            }
            setProduct(data.product);
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

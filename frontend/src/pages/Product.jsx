// Path: frontend/src/pages/Product.jsx
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useContext, useEffect, useState } from "react";

import Breadcrumb from "../components/breadcrumbs/breadcrumb";
import ProductDisplay from "../components/productDisplay/ProductDisplay";
import DescriptionBox from "../components/descriptionBox/DescriptionBox";
import RelatedProducts from "../components/relatedProducts/RelatedProducts";

const Product = () => {
  const {
    all_product,
    loading: contextLoading,
    error: contextError,
  } = useContext(ShopContext);
  const { productId, productSlug } = useParams();
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
          `http://localhost:4000/api/product/slug/${productSlug}?includeReviews=true`
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
        fetch(
          `http://localhost:4000/api/product/${productId}?includeReviews=true`
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

  // Show loading state if either we're still loading from context or still finding the product
  if (contextLoading || loading) {
    return <div className="loading">Loading product details...</div>;
  }

  // Show error if context has an error
  if (contextError) {
    return <div className="error">Error loading products: {contextError}</div>;
  }

  // Show error from product fetch if applicable
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Show not found if no product found
  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div>
      <Breadcrumb product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox product={product} />
      <RelatedProducts />
    </div>
  );
};

export default Product;

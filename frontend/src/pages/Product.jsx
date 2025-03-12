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
  const navigate = useNavigate();

  useEffect(() => {
    // Only try to find product when context is loaded
    if (!contextLoading) {
      if (all_product && all_product.length > 0) {
        let foundProduct;

        if (productId) {
          // Try to find by ID as a number first (for backward compatibility)
          foundProduct = all_product.find((e) => e.id === Number(productId));

          // If not found, try by MongoDB _id directly
          if (!foundProduct) {
            foundProduct = all_product.find((e) => {
              // Handle both string _id and object with $oid
              const mongoId =
                e._id && typeof e._id === "object" && e._id.$oid
                  ? e._id.$oid
                  : e._id;
              return mongoId === productId;
            });
          }

          // If found by ID but has a slug, redirect to the slug URL for better SEO
          if (foundProduct && foundProduct.slug) {
            navigate(`/products/${foundProduct.slug}`, { replace: true });
            return;
          }
        } else if (productSlug) {
          // Preferred: Lookup by slug
          foundProduct = all_product.find((e) => e.slug === productSlug);
        }

        setProduct(foundProduct);
      }
      // Set loading to false even if we didn't find a product
      setLoading(false);
    }
  }, [all_product, productId, productSlug, navigate, contextLoading]);

  // Show loading state if either we're still loading from context or still finding the product
  if (contextLoading || loading) {
    return <div className="loading">Loading product details...</div>;
  }

  // Show error if context has an error
  if (contextError) {
    return <div className="error">Error loading products: {contextError}</div>;
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

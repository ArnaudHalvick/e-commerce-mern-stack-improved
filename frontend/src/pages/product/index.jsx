import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProductDisplay from "../../components/productDisplay";
import DescriptionBox from "../../components/descriptionBox/DescriptionBox";
import RelatedProducts from "../../components/relatedProducts/RelatedProducts";
import ProductPageStatus from "./components/ProductPageStatus";
import EmptyState from "../../components/errorHandling/EmptyState";

// Hooks and Utilities
import useProductData from "./hooks/useProductData";
import { scrollToProductDisplay } from "../../utils/scrollHelpers";

/**
 * Product page component that displays product details
 */
const Product = () => {
  const { productId, productSlug } = useParams();
  const location = useLocation();
  const { product, loading, error } = useProductData(productId, productSlug);

  // Scroll product-display into view when product page is loaded or route changes
  useEffect(() => {
    if (product && !loading) {
      // Use the utility function to scroll the product display into view
      scrollToProductDisplay();
    }
  }, [product, loading, location.pathname]);

  // Show status component if loading or error
  if (loading || error) {
    return <ProductPageStatus loading={loading} error={error} />;
  }

  // Show not found if no product found
  if (!product) {
    return (
      <div>
        <Breadcrumb
          routes={[
            { label: "Home", path: "/" },
            { label: "Product Not Found" },
          ]}
        />
        <EmptyState
          title="Product Not Found"
          message={`We couldn't find the product you're looking for. It may have been removed or is no longer available.`}
          icon="🔍"
          actions={[
            {
              label: "Browse Products",
              to: "/",
              type: "primary",
            },
            {
              label: "Check Offers",
              to: "/offers",
              type: "secondary",
            },
          ]}
        />
      </div>
    );
  }

  // Create safe category path, defaulting to an empty string if category is undefined
  const categoryPath = product.category
    ? `/${product.category.toLowerCase()}`
    : "/";

  return (
    <div>
      <Breadcrumb
        routes={[
          { label: "Home", path: "/" },
          {
            label: product.category || "Products",
            path: categoryPath,
          },
          { label: product.name },
        ]}
      />
      <ProductDisplay product={product} />
      <DescriptionBox product={product} />
      <RelatedProducts product={product} />
    </div>
  );
};

export default Product;

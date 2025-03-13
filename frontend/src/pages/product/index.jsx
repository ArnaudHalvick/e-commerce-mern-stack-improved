import React from "react";
import { useParams } from "react-router-dom";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProductDisplay from "../../components/productDisplay";
import DescriptionBox from "../../components/descriptionBox/DescriptionBox";
import RelatedProducts from "../../components/relatedProducts/RelatedProducts";
import ProductPageStatus from "./components/ProductPageStatus";

// Hooks
import useProductData from "./hooks/useProductData";

/**
 * Product page component that displays product details
 */
const Product = () => {
  const { productId, productSlug } = useParams();
  const { product, loading, error } = useProductData(productId, productSlug);

  // Show status component if loading or error
  if (loading || error) {
    return <ProductPageStatus loading={loading} error={error} />;
  }

  // Show not found if no product found
  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  return (
    <div>
      <Breadcrumb
        routes={[
          { label: "HOME", path: "/" },
          { label: "SHOP", path: "/" },
          {
            label: product.category,
            path: `/${product.category.toLowerCase()}`,
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

import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

// Components
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import ProductDisplay from "../../components/productDisplay";
import DescriptionBox from "../../components/descriptionBox/index";
import RelatedProducts from "../../components/relatedProducts/RelatedProducts";
import ProductPageStatus from "./components/ProductPageStatus";
import EmptyState from "../../components/errorHandling/emptyState/EmptyState";
import SEO from "../../utils/SEO";

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

  // Generate SEO data for the product
  const getProductSEO = () => {
    if (!product) {
      return {
        title: "Product Not Found",
        description:
          "The product you're looking for could not be found. It may have been removed or is no longer available.",
        keywords: "product not found, error",
        type: "website",
      };
    }

    // Format price for SEO description
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(product.new_price || product.old_price);

    // Construct keywords from product properties
    const keywordParts = [
      product.name,
      product.category,
      ...(product.tags || []),
      product.brand,
      product.type,
    ].filter(Boolean);

    return {
      title: product.name,
      description: `${product.name} - ${formattedPrice}. ${
        product.description
          ? product.description.slice(0, 150)
          : "Shop now and get great deals on our products."
      }${product.description && product.description.length > 150 ? "..." : ""}`,
      keywords: keywordParts.join(", "),
      type: "product",
      image: product.image,
      url: `/products/${product.slug || productId}`,
      // Add structured data for product
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: product.image,
        description: product.description,
        brand: {
          "@type": "Brand",
          name: product.brand || "MERN E-Commerce",
        },
        offers: {
          "@type": "Offer",
          url: `/products/${product.slug || productId}`,
          priceCurrency: "USD",
          price: product.new_price || product.old_price,
          availability: product.in_stock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    };
  };

  // Show status component if loading or error
  if (loading || error) {
    return (
      <>
        <SEO
          title={error ? "Error Loading Product" : "Loading Product"}
          description={
            error
              ? "There was an error loading the product information. Please try again later."
              : "Please wait while we load the product details."
          }
        />
        <ProductPageStatus loading={loading} error={error} />
      </>
    );
  }

  // Get SEO data
  const seoData = getProductSEO();

  // Show not found if no product found
  if (!product) {
    return (
      <div>
        <SEO {...seoData} />
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
              to: "/shop",
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
      <SEO {...seoData} strategy="replace">
        {/* Add structured data as JSON-LD */}
        {seoData.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(seoData.structuredData)}
          </script>
        )}
      </SEO>
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

import React from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../../../components/errorHandling/EmptyState";
import Breadcrumb from "../../../components/breadcrumbs/Breadcrumb";
import Spinner from "../../../components/ui/Spinner";
import "../../../components/errorHandling/LoadingIndicator.css";

/**
 * Component for displaying loading and error states on product page
 *
 * @param {Object} props - Component props
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.error - Error message
 */
const ProductPageStatus = ({ loading, error }) => {
  const { productId, productSlug } = useParams();
  const identifier = productSlug || productId || "this product";

  return (
    <div>
      <Breadcrumb
        routes={[
          { label: "Home", path: "/" },
          { label: loading ? "Loading Product" : "Product Error" },
        ]}
      />

      {loading && (
        <div className="loading-container">
          <Spinner
            message="Loading product details..."
            size="medium"
            className="product-page-spinner"
          />
        </div>
      )}

      {error && (
        <EmptyState
          title="Product Loading Error"
          message={`We had trouble loading details for ${identifier}. ${error}`}
          icon="⚠️"
          actions={[
            {
              label: "Try Again",
              onClick: () => window.location.reload(),
              type: "primary",
            },
            {
              label: "Browse All Products",
              to: "/",
              type: "secondary",
            },
          ]}
        />
      )}
    </div>
  );
};

export default ProductPageStatus;

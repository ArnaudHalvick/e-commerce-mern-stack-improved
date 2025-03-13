import React from "react";

/**
 * Component for displaying loading and error states on product page
 *
 * @param {Object} props - Component props
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.error - Error message
 */
const ProductPageStatus = ({ loading, error }) => {
  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return null;
};

export default ProductPageStatus;

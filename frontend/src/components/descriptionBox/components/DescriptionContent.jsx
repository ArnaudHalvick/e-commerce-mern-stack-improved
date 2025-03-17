import React from "react";

/**
 * Component for the description tab content
 * @param {object} props - Component props
 * @param {object} props.product - Product object
 * @returns {JSX.Element} - Description content component
 */
const DescriptionContent = ({ product }) => {
  return (
    <div className="custom-description-content">
      {product && product.longDescription
        ? product.longDescription
        : "No description available"}
    </div>
  );
};

export default DescriptionContent;

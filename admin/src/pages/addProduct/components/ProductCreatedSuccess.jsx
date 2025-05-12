import React from "react";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/card/Card";
import { ImageGalleryDisplay } from "../../../components/imageGallery";
import "../styles/ProductCreatedSuccess.css";

/**
 * Component displayed after successful product creation
 *
 * @param {Object} props
 * @param {Object} props.product - Created product data
 * @param {Function} props.onCreateAnother - Handler for "Create Another" button
 * @param {Function} props.onViewProduct - Handler for "View Product" button
 * @returns {JSX.Element}
 */
const ProductCreatedSuccess = ({ product, onCreateAnother, onViewProduct }) => {
  if (!product) return null;

  // Ensure values exist before using toFixed
  const oldPrice = product.old_price || 0;
  const newPrice = product.new_price || 0;
  const hasDiscount = newPrice > 0 && newPrice < oldPrice;

  return (
    <Card className="add-product-success-card">
      <div className="add-product-success-content">
        <div className="add-product-success-header">
          <h2 className="add-product-success-title">
            Product Created Successfully!
          </h2>
          <p className="add-product-success-description">
            Your product "{product.name}" has been created and is now available
            in your store.
          </p>
        </div>

        {product.images && product.images.length > 0 && (
          <div className="add-product-success-image">
            <ImageGalleryDisplay
              images={product.images}
              mainImageIndex={product.mainImageIndex || 0}
              size="medium"
            />
          </div>
        )}

        <div className="add-product-success-details">
          <div className="add-product-success-detail">
            <span className="add-product-success-label">Name:</span>
            <span className="add-product-success-value">{product.name}</span>
          </div>
          <div className="add-product-success-detail">
            <span className="add-product-success-label">Category:</span>
            <span className="add-product-success-value">
              {product.category}
            </span>
          </div>
          <div className="add-product-success-detail">
            <span className="add-product-success-label">Price:</span>
            <span className="add-product-success-value">
              ${oldPrice.toFixed(2)}
              {hasDiscount && (
                <span className="add-product-success-discount">
                  {" "}
                  (On sale: ${newPrice.toFixed(2)})
                </span>
              )}
            </span>
          </div>
          {product.types && product.types.length > 0 && (
            <div className="add-product-success-detail">
              <span className="add-product-success-label">Type:</span>
              <span className="add-product-success-value">
                {product.types.join(", ")}
              </span>
            </div>
          )}
          {product.sizes && product.sizes.length > 0 && (
            <div className="add-product-success-detail">
              <span className="add-product-success-label">Sizes:</span>
              <span className="add-product-success-value">
                {product.sizes.join(", ")}
              </span>
            </div>
          )}
        </div>

        <div className="add-product-success-actions">
          <Button variant="secondary" onClick={onCreateAnother}>
            Create Another Product
          </Button>
          <Button variant="primary" onClick={onViewProduct}>
            View Product Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCreatedSuccess;

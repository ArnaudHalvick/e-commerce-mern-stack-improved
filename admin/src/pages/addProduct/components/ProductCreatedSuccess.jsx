import React from "react";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/card/Card";
import { getImageUrl } from "../../../api/config";
import "../styles/ProductCreatedSuccess.css";

/**
 * Simple component to display product images in a grid
 */
const SimpleImageDisplay = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="add-product-success-image-grid">
      {images.map((image, index) => (
        <div key={index} className="add-product-success-image-item">
          <img
            src={getImageUrl(image)}
            alt={`Product view ${index + 1}`}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Component displayed after successful product creation
 *
 * @param {Object} props
 * @param {Object} props.product - Created product data
 * @param {Function} props.onCreateAnother - Handler for "Create Another" button
 * @returns {JSX.Element}
 */
const ProductCreatedSuccess = ({ product, onCreateAnother }) => {
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
            <SimpleImageDisplay images={product.images} />
          </div>
        )}

        <div className="add-product-success-details">
          <div className="add-product-success-detail">
            <span className="add-product-success-label">Product ID:</span>
            <span className="add-product-success-value">{product._id}</span>
          </div>
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
          {product.shortDescription && (
            <div className="add-product-success-detail">
              <span className="add-product-success-label">
                Short Description:
              </span>
              <span className="add-product-success-value">
                {product.shortDescription}
              </span>
            </div>
          )}
          {product.longDescription && (
            <div className="add-product-success-detail">
              <span className="add-product-success-label">
                Long Description:
              </span>
              <span className="add-product-success-value">
                {product.longDescription}
              </span>
            </div>
          )}
          {product.description && (
            <div className="add-product-success-detail">
              <span className="add-product-success-label">Description:</span>
              <span className="add-product-success-value">
                {product.description}
              </span>
            </div>
          )}
        </div>

        <div className="add-product-success-actions">
          <Button variant="secondary" onClick={onCreateAnother}>
            Create Another Product
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCreatedSuccess;

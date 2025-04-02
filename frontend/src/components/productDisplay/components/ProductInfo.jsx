import React, { useMemo } from "react";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";
import "./ProductInfo.css";

/**
 * Component for displaying product information (name, rating, price, description)
 *
 * @param {Object} props
 * @param {Object} props.product - The product data
 */
const ProductInfo = ({ product }) => {
  // Check if the product has a discount (new_price > 0)
  const hasDiscount = product.new_price && product.new_price > 0;

  // Render star rating
  const renderStarRating = useMemo(() => {
    const rating = product.rating || 0;
    const stars = [];
    let fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    if (decimalPart >= 0.7) fullStars += 1;
    fullStars = Math.min(fullStars, 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img
          key={i}
          src={i <= fullStars ? star_icon : star_dull_icon}
          alt="star"
          className="product-display-star-icon"
        />
      );
    }
    return stars;
  }, [product.rating]);

  const reviewCount = useMemo(
    () => (product.reviews ? product.reviews.length : 0),
    [product.reviews]
  );

  const productTypes = useMemo(
    () => product.types?.join(", ") || "N/A",
    [product.types]
  );

  const productTags = useMemo(
    () => product.tags?.join(", ") || "N/A",
    [product.tags]
  );

  return (
    <>
      <h1 className="product-display-right-title">{product.name}</h1>
      <div className="product-display-right-stars">
        {renderStarRating}
        <p className="product-display-review-count">({reviewCount})</p>
      </div>
      <div className="product-display-right-prices">
        {hasDiscount ? (
          <>
            <div className="product-display-right-price-old">
              ${product.old_price}
            </div>
            <div className="product-display-right-price-new">
              ${product.new_price}
            </div>
          </>
        ) : (
          <div className="product-display-right-price-single">
            ${product.old_price}
          </div>
        )}
      </div>
      <div className="product-display-right-description">
        <p className="product-display-description-text">
          {product.shortDescription}
        </p>
      </div>
      <p className="product-display-right-category">
        <span className="product-display-category-label">Category: </span>
        {product.types && product.types.length > 0 ? productTypes : ""}
      </p>
      <p className="product-display-right-category">
        <span className="product-display-category-label">Tags: </span>
        {productTags}
      </p>
    </>
  );
};

export default ProductInfo;

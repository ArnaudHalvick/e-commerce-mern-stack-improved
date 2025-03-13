import "./ProductDisplay.css";
import React from "react";
import {
  ImageGallery,
  ProductInfo,
  SizeSelector,
  QuantitySelector,
} from "./components";
import useProductDisplay from "./hooks/useProductDisplay";

/**
 * Product display component showing product details and purchase options
 *
 * @param {Object} props
 * @param {Object} props.product - The product data
 */
const ProductDisplay = ({ product }) => {
  const {
    selectedSize,
    quantity,
    sizeError,
    selectedImageIndex,
    setSelectedImageIndex,
    getBaseUrl,
    isAdding,
    handleSizeSelect,
    handleQuantityChange,
    handleAddToCart,
  } = useProductDisplay(product);

  return (
    <div className="product-display">
      <ImageGallery
        images={product.images}
        selectedImageIndex={selectedImageIndex}
        setSelectedImageIndex={setSelectedImageIndex}
        getBaseUrl={getBaseUrl}
      />

      <div className="product-display-right">
        <ProductInfo product={product} />

        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSizeSelect={handleSizeSelect}
          sizeError={sizeError}
        />

        <QuantitySelector
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
        />

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={
            isAdding ? "add-to-cart-btn adding-to-cart" : "add-to-cart-btn"
          }
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductDisplay;

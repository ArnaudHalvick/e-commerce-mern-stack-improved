import "./ProductDisplay.css";
import React, { useEffect, useRef } from "react";
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
  const displayRef = useRef(null);

  const {
    selectedSize,
    quantity,
    sizeError,
    selectedImageIndex,
    setSelectedImageIndex,
    isAdding,
    handleSizeSelect,
    handleQuantityChange,
    handleAddToCart,
  } = useProductDisplay(product);

  // Make the ref accessible via an ID for easier scrolling from outside
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.id = "product-display";
    }
  }, []);

  return (
    <div className="product-display" ref={displayRef}>
      <ImageGallery
        images={product.images}
        selectedImageIndex={selectedImageIndex}
        setSelectedImageIndex={setSelectedImageIndex}
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

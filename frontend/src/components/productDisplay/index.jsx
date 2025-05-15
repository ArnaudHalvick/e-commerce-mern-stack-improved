import React from "react";

// Internal Components
import {
  ImageGallery,
  ProductInfo,
  SizeSelector,
  QuantitySelector,
  AddToCartButton,
} from "./components";

// Internal Hooks
import { useProductDisplay, useProductId } from "./hooks";

// Styles
import "./styles/index.css";

/**
 * Product display component showing product details and purchase options
 *
 * @param {Object} props
 * @param {Object} props.product - The product data
 * @returns {JSX.Element} ProductDisplay component
 */
const ProductDisplay = ({ product }) => {
  // Get reference for product display container
  const displayRef = useProductId();

  // Get product display state and handlers
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

  return (
    <div className="product-display" ref={displayRef}>
      <ImageGallery
        images={product.images}
        selectedImageIndex={selectedImageIndex}
        setSelectedImageIndex={setSelectedImageIndex}
        mainImageIndex={product.mainImageIndex || 0}
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

        <AddToCartButton onClick={handleAddToCart} isAdding={isAdding} />
      </div>
    </div>
  );
};

export default ProductDisplay;

import React from "react";

/**
 * Component for selecting product size
 *
 * @param {Object} props
 * @param {Array} props.sizes - Available sizes
 * @param {String} props.selectedSize - Currently selected size
 * @param {Function} props.onSizeSelect - Handler for size selection
 * @param {Boolean} props.sizeError - Whether there's a size selection error
 */
const SizeSelector = ({ sizes, selectedSize, onSizeSelect, sizeError }) => {
  return (
    <div className="product-display-right-size">
      <h1>Select Size</h1>
      {sizeError && <p className="size-error">Please select a size</p>}
      <div className="product-display-right-size-container">
        {sizes &&
          sizes.map((size, index) => (
            <div
              key={index}
              className={selectedSize === size ? "size-selected" : ""}
              onClick={() => onSizeSelect(size)}
            >
              {size}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SizeSelector;

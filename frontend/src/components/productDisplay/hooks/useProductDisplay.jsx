import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../../hooks/state";
import { addToCart } from "../../../redux/slices/cartSlice";
import useErrorRedux from "../../../hooks/useErrorRedux";

/**
 * Custom hook for product display logic
 *
 * @param {Object} product - The product data
 * @returns {Object} State and handler methods for product display
 */
const useProductDisplay = (product) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { showError } = useErrorRedux();
  const [isAdding, setIsAdding] = useState(false);

  // State for selected size and quantity
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Set up state for the currently selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(
    product.mainImageIndex || 0
  );

  // Handle size selection
  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
    setSizeError(false);
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback((value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantity(newValue);
  }, []);

  // Handle Add to Cart
  const handleAddToCart = useCallback(() => {
    if (isAdding) return;

    // Validate size selection
    if (!selectedSize) {
      setSizeError(true);
      showError("Please select a size before adding to cart");
      return;
    }

    setIsAdding(true);
    if (isAuthenticated) {
      dispatch(
        addToCart({
          itemId: product._id,
          quantity: quantity,
          size: selectedSize,
        })
      )
        .unwrap()
        .then(() => {
          // Success handled by cart UI update
        })
        .catch((err) => {
          // Show appropriate error message
          if (typeof err === "string") {
            if (
              err.includes("Authentication required") ||
              err.includes("401")
            ) {
              showError("Please login again to add items to cart");
            } else if (err.includes("Size is required")) {
              setSizeError(true);
              showError("Please select a size for this product");
            } else {
              showError(err || "Failed to add item to cart. Please try again.");
            }
          } else {
            showError("Failed to add item to cart. Please try again.");
          }
        })
        .finally(() => {
          setTimeout(() => setIsAdding(false), 500);
        });
    } else {
      showError("Please login to add items to cart");
      setIsAdding(false);
    }
  }, [
    dispatch,
    product._id,
    isAuthenticated,
    isAdding,
    quantity,
    selectedSize,
    showError,
    setSizeError,
  ]);

  return {
    selectedSize,
    quantity,
    sizeError,
    selectedImageIndex,
    setSelectedImageIndex,
    isAdding,
    handleSizeSelect,
    handleQuantityChange,
    handleAddToCart,
  };
};

export default useProductDisplay;

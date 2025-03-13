import { useState, useMemo, useCallback, useContext } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../redux/slices/cartSlice";
import { AuthContext } from "../../../context/AuthContext";

/**
 * Custom hook for product display logic
 *
 * @param {Object} product - The product data
 * @returns {Object} State and handler methods for product display
 */
const useProductDisplay = (product) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);
  const [isAdding, setIsAdding] = useState(false);

  // State for selected size and quantity
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Set up state for the currently selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(
    product.mainImageIndex || 0
  );

  // Utility to get the base URL from any product image
  const getBaseUrl = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const sampleUrl = product.images[0];
      const urlParts = sampleUrl.split("/");
      if (urlParts.length >= 3) {
        return `${urlParts[0]}//${urlParts[2]}`;
      }
    }
    return "http://localhost:4000";
  }, [product.images]);

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
      );
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      alert("Please login to add items to cart");
      setIsAdding(false);
    }
  }, [
    dispatch,
    product._id,
    isAuthenticated,
    isAdding,
    quantity,
    selectedSize,
  ]);

  return {
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
  };
};

export default useProductDisplay;

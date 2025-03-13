import { useState, useEffect, useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  addToCart,
  updateCartItem,
} from "../../../redux/slices/cartSlice";
import { AuthContext } from "../../../context/AuthContext";

/**
 * Custom hook for cart operations and state management
 *
 * @returns {Object} Cart state and handler methods
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);

  // Get cart state from Redux with fallback values
  const {
    items = [],
    totalPrice = 0,
    loading,
    error,
  } = useSelector(
    (state) => state.cart || { items: [], totalItems: 0, totalPrice: 0 }
  );

  const [editableQuantities, setEditableQuantities] = useState({});
  // Local state for optimistic UI updates
  const [localTotalPrice, setLocalTotalPrice] = useState(totalPrice);

  // Update local total price when Redux state changes
  useEffect(() => {
    setLocalTotalPrice(totalPrice);
  }, [totalPrice]);

  // Fetch cart data when component mounts or auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleQuantityChange = useCallback((id, value, size) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    const key = `${id}-${size}`;
    setEditableQuantities((prev) => ({ ...prev, [key]: newValue }));
  }, []);

  const handleQuantityBlur = useCallback(
    (id, size) => {
      const key = `${id}-${size}`;
      const newValue = editableQuantities[key];
      if (newValue !== undefined) {
        dispatch(updateCartItem({ itemId: id, quantity: newValue, size }));

        // Clear the editable state
        setEditableQuantities((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }
    },
    [dispatch, editableQuantities]
  );

  const handleRemoveAll = useCallback(
    (id, size) => {
      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price * item.quantity);
      }
      dispatch(removeFromCart({ itemId: id, removeAll: true, size }));
    },
    [dispatch, items]
  );

  const handleAddItem = useCallback(
    (id, size) => {
      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev + item.price);
      }
      dispatch(addToCart({ itemId: id, quantity: 1, size }));
    },
    [dispatch, items]
  );

  const handleRemoveItem = useCallback(
    (id, size) => {
      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price);
      }
      dispatch(removeFromCart({ itemId: id, quantity: 1, size }));
    },
    [dispatch, items]
  );

  return {
    items,
    localTotalPrice,
    loading,
    error,
    handleQuantityChange,
    handleQuantityBlur,
    handleRemoveAll,
    handleAddItem,
    handleRemoveItem,
  };
};

export default useCart;

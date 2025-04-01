import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  addToCart,
  updateCartItem,
} from "../../../redux/slices/cartSlice";
import { useAuth } from "../../../hooks/state";
import { useError } from "../../../context/ErrorContext";

/**
 * Custom hook for cart operations and state management
 *
 * @returns {Object} Cart state and handler methods
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { showError } = useError();

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
      dispatch(fetchCart()).catch((err) => {
        console.error("Error fetching cart:", err);
        // Don't show error to user to prevent UI disruption
      });
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
        dispatch(
          updateCartItem({ itemId: id, quantity: newValue, size })
        ).catch((err) => {
          console.error("Error updating quantity:", err);
          showError("Failed to update quantity. Please try again.");
        });

        // Clear the editable state
        setEditableQuantities((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }
    },
    [dispatch, editableQuantities, showError]
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
      dispatch(removeFromCart({ itemId: id, removeAll: true, size })).catch(
        (err) => {
          console.error("Error removing items:", err);
          showError("Failed to remove items. Please try again.");
        }
      );
    },
    [dispatch, items, showError]
  );

  const handleAddItem = useCallback(
    (id, size) => {
      if (!isAuthenticated) {
        showError("Please login to modify your cart");
        return;
      }

      // Find the item to calculate price impact
      const item = items.find(
        (item) => item.productId === id && item.size === size
      );
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev + item.price);
      }
      dispatch(addToCart({ itemId: id, quantity: 1, size })).catch((err) => {
        console.error("Error adding item:", err);
        // If the add operation fails, revert the optimistic UI update
        if (item) {
          setLocalTotalPrice((prev) => prev - item.price);
        }
        showError("Failed to update cart. Please try again.");
      });
    },
    [dispatch, items, isAuthenticated, showError]
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
      dispatch(removeFromCart({ itemId: id, quantity: 1, size })).catch(
        (err) => {
          console.error("Error removing item:", err);
          // If the remove operation fails, revert the optimistic UI update
          if (item) {
            setLocalTotalPrice((prev) => prev + item.price);
          }
          showError("Failed to update cart. Please try again.");
        }
      );
    },
    [dispatch, items, showError]
  );

  return {
    items,
    totalPrice: localTotalPrice,
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

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart as clearCartAction,
} from "../../redux/slices/cartSlice";
import useAuth from "./useAuth";

/**
 * Custom hook for cart management
 * Provides direct access to cart state and operations
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  // Get cart state from Redux
  const {
    items = [],
    totalItems = 0,
    totalPrice = 0,
    loading = false,
    error = null,
  } = useSelector(
    (state) => state.cart || { items: [], totalItems: 0, totalPrice: 0 }
  );

  // Local state for optimistic UI updates
  const [localTotalPrice, setLocalTotalPrice] = useState(totalPrice);

  // Keep track of pending operations to avoid UI flicker
  const pendingOperations = useRef({});
  const pendingCount = useRef(0);

  // Update local total price when Redux state changes and no pending operations
  useEffect(() => {
    if (pendingCount.current === 0) {
      setLocalTotalPrice(totalPrice);
    }
  }, [totalPrice]);

  // Fetch cart data when component mounts or auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Helper to track pending operations
  const trackOperation = (itemId, size, operationType) => {
    const key = `${itemId}-${size}-${operationType}`;
    pendingOperations.current[key] = true;
    pendingCount.current += 1;

    return () => {
      delete pendingOperations.current[key];
      pendingCount.current = Math.max(0, pendingCount.current - 1);
    };
  };

  /**
   * Add item to cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - Quantity to add
   * @param {string} size - Product size
   * @returns {Promise} - Cart operation result
   */
  const addItem = useCallback(
    (itemId, quantity = 1, size) => {
      if (!isAuthenticated)
        return Promise.resolve({
          success: false,
          message: "Authentication required",
        });

      // Find item for optimistic update
      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      // Apply optimistic update to local price
      if (item) {
        setLocalTotalPrice((prev) => prev + item.price * quantity);
      }

      // Track this operation
      const cleanupOperation = trackOperation(itemId, size, "add");

      // Dispatch action and clean up tracking when done
      return dispatch(addToCart({ itemId, quantity, size })).finally(() => {
        cleanupOperation();
      });
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Remove item from cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - Quantity to remove
   * @param {string} size - Product size
   * @returns {Promise} - Cart operation result
   */
  const removeItem = useCallback(
    (itemId, quantity = 1, size) => {
      if (!isAuthenticated)
        return Promise.resolve({
          success: false,
          message: "Authentication required",
        });

      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice(
          (prev) => prev - item.price * Math.min(quantity, item.quantity)
        );
      }

      // Track this operation
      const cleanupOperation = trackOperation(itemId, size, "remove");

      return dispatch(removeFromCart({ itemId, quantity, size })).finally(
        () => {
          cleanupOperation();
        }
      );
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Remove all instances of an item from cart
   * @param {string} itemId - Product ID
   * @param {string} size - Product size
   * @returns {Promise} - Cart operation result
   */
  const removeAllItems = useCallback(
    (itemId, size) => {
      if (!isAuthenticated)
        return Promise.resolve({
          success: false,
          message: "Authentication required",
        });

      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price * item.quantity);
      }

      // Track this operation
      const cleanupOperation = trackOperation(itemId, size, "removeAll");

      return dispatch(
        removeFromCart({ itemId, removeAll: true, size })
      ).finally(() => {
        cleanupOperation();
      });
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Update item quantity in cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - New quantity
   * @param {string} size - Product size
   * @returns {Promise} - Cart operation result
   */
  const updateQuantity = useCallback(
    (itemId, quantity, size) => {
      if (!isAuthenticated || quantity < 1) {
        return Promise.resolve({
          success: false,
          message: !isAuthenticated
            ? "Authentication required"
            : "Quantity must be at least 1",
        });
      }

      // Find the current item for optimistic UI update
      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (item) {
        // Calculate price difference and update local total
        const priceDifference = item.price * (quantity - item.quantity);
        setLocalTotalPrice((prev) => prev + priceDifference);
      }

      // Track this operation
      const cleanupOperation = trackOperation(itemId, size, "update");

      return dispatch(updateCartItem({ itemId, quantity, size })).finally(
        () => {
          cleanupOperation();
        }
      );
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Clear the entire cart
   * @returns {Promise} - Cart operation result
   */
  const clearCart = useCallback(() => {
    if (!isAuthenticated)
      return Promise.resolve({
        success: false,
        message: "Authentication required",
      });

    // Reset pending operations
    pendingOperations.current = {};
    pendingCount.current = 0;

    return dispatch(clearCartAction());
  }, [dispatch, isAuthenticated]);

  // Derived values
  const isCartEmpty = items.length === 0;
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    // Cart state
    items,
    totalItems,
    totalPrice: localTotalPrice,
    loading,
    error,
    isCartEmpty,
    cartItemCount,

    // Cart actions
    fetchCart: () => dispatch(fetchCart()),
    addItem,
    removeItem,
    removeAllItems,
    updateQuantity,
    clearCart,
  };
};

export default useCart;

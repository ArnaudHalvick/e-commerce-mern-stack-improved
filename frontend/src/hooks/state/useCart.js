import { useState, useEffect, useCallback } from "react";
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

      return dispatch(addToCart({ itemId, quantity, size }));
    },
    [dispatch, isAuthenticated]
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

      return dispatch(removeFromCart({ itemId, quantity, size }));
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

      return dispatch(removeFromCart({ itemId, removeAll: true, size }));
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

      return dispatch(updateCartItem({ itemId, quantity, size }));
    },
    [dispatch, isAuthenticated]
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

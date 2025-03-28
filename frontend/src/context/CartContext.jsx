import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from "../redux/slices/cartSlice";
import { AuthContext } from "./AuthContext";

// Create the Cart context
export const CartContext = createContext(null);

/**
 * CartContext Provider Component
 *
 * Provides cart state and operations throughout the application.
 * Acts as a bridge between Redux (for data persistence) and React Context (for easy component access)
 */
const CartContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);

  // Get cart state from Redux with fallback values
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
   * @param {string} size - Size of the product
   */
  const addItemToCart = useCallback(
    (itemId, quantity = 1, size) => {
      if (!isAuthenticated) return;

      dispatch(addToCart({ itemId, quantity, size }));
    },
    [dispatch, isAuthenticated]
  );

  /**
   * Remove item from cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - Quantity to remove
   * @param {string} size - Size of the product
   */
  const removeItemFromCart = useCallback(
    (itemId, quantity = 1, size) => {
      if (!isAuthenticated) return;

      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice(
          (prev) => prev - item.price * Math.min(quantity, item.quantity)
        );
      }

      dispatch(removeFromCart({ itemId, quantity, size }));
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Remove all instances of an item from cart
   * @param {string} itemId - Product ID
   * @param {string} size - Size of the product
   */
  const removeAllFromCart = useCallback(
    (itemId, size) => {
      if (!isAuthenticated) return;

      const item = items.find(
        (item) => item.productId === itemId && item.size === size
      );

      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price * item.quantity);
      }

      dispatch(removeFromCart({ itemId, removeAll: true, size }));
    },
    [dispatch, items, isAuthenticated]
  );

  /**
   * Update item quantity in cart
   * @param {string} itemId - Product ID
   * @param {number} quantity - New quantity
   * @param {string} size - Size of the product
   */
  const updateItemQuantity = useCallback(
    (itemId, quantity, size) => {
      if (!isAuthenticated || quantity < 1) return;

      dispatch(updateCartItem({ itemId, quantity, size }));
    },
    [dispatch, isAuthenticated]
  );

  /**
   * Clear the entire cart
   */
  const clearEntireCart = useCallback(() => {
    if (!isAuthenticated) return;

    dispatch(clearCart());
  }, [dispatch, isAuthenticated]);

  // Check if cart is empty
  const isCartEmpty = items.length === 0;

  // Calculate cart totals
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Context value
  const cartContextValue = {
    // Cart state
    items,
    totalItems,
    totalPrice: localTotalPrice, // Use local state for responsive UI
    loading,
    error,
    isCartEmpty,
    cartItemCount,

    // Cart actions
    fetchCart: () => dispatch(fetchCart()),
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    removeAllItems: removeAllFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearEntireCart,
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook to use the Cart Context
 * @returns {Object} Cart context value
 */
export const useCartContext = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }

  return context;
};

export default CartContextProvider;

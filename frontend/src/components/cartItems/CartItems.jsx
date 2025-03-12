// Path: frontend/src/components/cartItems/CartItems.jsx
import "./CartItems.css";
import { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  addToCart,
  updateCartItem,
} from "../../redux/slices/cartSlice";
import { AuthContext } from "../../context/AuthContext";
import CartItem from "./CartItem";

const CartItems = () => {
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
  const handleQuantityChange = useCallback((id, value) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    setEditableQuantities((prev) => ({ ...prev, [id]: newValue }));
  }, []);

  const handleQuantityBlur = useCallback(
    (id) => {
      const newValue = editableQuantities[id];
      if (newValue !== undefined) {
        dispatch(updateCartItem({ itemId: id, quantity: newValue }));

        // Clear the editable state
        setEditableQuantities((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }
    },
    [dispatch, editableQuantities]
  );

  const handleRemoveAll = useCallback(
    (id) => {
      // Find the item to calculate price impact
      const item = items.find((item) => item.productId === id);
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price * item.quantity);
      }
      dispatch(removeFromCart({ itemId: id, removeAll: true }));
    },
    [dispatch, items]
  );

  const handleAddItem = useCallback(
    (id) => {
      // Find the item to calculate price impact
      const item = items.find((item) => item.productId === id);
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev + item.price);
      }
      dispatch(addToCart({ itemId: id, quantity: 1 }));
    },
    [dispatch, items]
  );

  const handleRemoveItem = useCallback(
    (id) => {
      // Find the item to calculate price impact
      const item = items.find((item) => item.productId === id);
      if (item) {
        // Update local total price immediately for better UX
        setLocalTotalPrice((prev) => prev - item.price);
      }
      dispatch(removeFromCart({ itemId: id, quantity: 1 }));
    },
    [dispatch, items]
  );

  // Display loading message
  if (loading && items.length === 0) {
    return <div className="cart-loading">Loading cart...</div>;
  }

  // Display error message if any
  if (error) {
    return <div className="cart-error">Error: {error}</div>;
  }

  // Display empty cart message
  if (!items || items.length === 0) {
    return <div className="cart-empty">Your cart is empty</div>;
  }

  return (
    <div className="cart-container">
      {/* Cart Table */}
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Title</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onRemoveItem={handleRemoveItem}
              onAddItem={handleAddItem}
              onRemoveAll={handleRemoveAll}
              onQuantityChange={handleQuantityChange}
              onQuantityBlur={handleQuantityBlur}
            />
          ))}
        </tbody>
      </table>

      {/* Cart Totals Section */}
      <div className="cart-totals">
        <h2 className="cart-totals-title">Cart Totals</h2>
        <div className="cart-totals-item">
          <p className="cart-totals-label">Subtotal</p>
          <p className="cart-totals-value cart-price-discounted">
            ${localTotalPrice.toFixed(2)}
          </p>
        </div>
        <div className="cart-totals-item">
          <p className="cart-totals-label">Shipping Fee</p>
          <p className="cart-totals-value">Free</p>
        </div>
        <hr className="cart-divider" />
        <div className="cart-totals-item">
          <p className="cart-totals-label">Total</p>
          <p className="cart-totals-value cart-total-amount cart-price-discounted">
            ${localTotalPrice.toFixed(2)}
          </p>
        </div>
        <button className="checkout-button">PROCEED TO CHECKOUT</button>

        {/* Promo Code Section */}
        <div className="promo-code-section">
          <p className="promo-code-text">
            If you have a promo code, Enter it here
          </p>
          <div className="promo-code-input-container">
            <input
              type="text"
              className="promo-code-input"
              placeholder="promo code"
            />
            <button className="promo-code-submit">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;

// Path: frontend/src/components/cartItems/CartItems.jsx
import "./CartItems.css";
import remove_icon from "../assets/cart_cross_icon.png";
import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  addToCart,
  updateCartItem,
} from "../../redux/slices/cartSlice";
import { AuthContext } from "../../context/AuthContext";

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

  // Fetch cart data when component mounts or auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Handle item quantity change
  const handleQuantityChange = (id, value) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    setEditableQuantities({ ...editableQuantities, [id]: newValue });
  };

  // Handle quantity input blur event
  const handleQuantityBlur = (id) => {
    const newValue = editableQuantities[id];
    if (newValue !== undefined) {
      dispatch(updateCartItem({ itemId: id, quantity: newValue }));

      // Clear the editable state
      const newEditableQuantities = { ...editableQuantities };
      delete newEditableQuantities[id];
      setEditableQuantities(newEditableQuantities);
    }
  };

  // Handle removing all items of a product
  const handleRemoveAll = (id) => {
    dispatch(removeFromCart({ itemId: id, removeAll: true }));
  };

  // Handle adding item to cart
  const handleAddItem = (id) => {
    dispatch(addToCart({ itemId: id, quantity: 1 }));
  };

  // Handle removing item from cart
  const handleRemoveItem = (id) => {
    dispatch(removeFromCart({ itemId: id, quantity: 1 }));
  };

  // Display loading message
  if (loading) {
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
            <tr key={item.productId}>
              <td>
                <img
                  className="cart-product-image"
                  src={item.image}
                  alt={item.name}
                />
              </td>
              <td>{item.name}</td>
              <td>
                <span
                  className={item.isDiscounted ? "cart-price-discounted" : ""}
                >
                  ${item.price}
                </span>
              </td>
              <td>
                <div className="cart-quantity-controls">
                  <button
                    className="cart-quantity-adjust-btn"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="cart-quantity-input"
                    value={
                      editableQuantities[item.productId] !== undefined
                        ? editableQuantities[item.productId]
                        : item.quantity
                    }
                    onChange={(event) =>
                      handleQuantityChange(item.productId, event.target.value)
                    }
                    onBlur={() => handleQuantityBlur(item.productId)}
                    min="1"
                  />
                  <button
                    className="cart-quantity-adjust-btn"
                    onClick={() => handleAddItem(item.productId)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>
                <span
                  className={item.isDiscounted ? "cart-price-discounted" : ""}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </td>
              <td>
                <div className="cart-remove-icon-container">
                  <img
                    className="cart-remove-icon"
                    onClick={() => handleRemoveAll(item.productId)}
                    src={remove_icon}
                    alt=""
                    title="Remove all"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cart Totals Section */}
      <div className="cart-totals">
        <h2 className="cart-totals-title">Cart Totals</h2>
        <div className="cart-totals-item">
          <p className="cart-totals-label">Subtotal</p>
          <p className="cart-totals-value cart-price-discounted">
            ${totalPrice.toFixed(2)}
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
            ${totalPrice.toFixed(2)}
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

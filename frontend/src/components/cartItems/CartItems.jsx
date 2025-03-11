import "./CartItems.css";
import remove_icon from "../assets/cart_cross_icon.png";
import { useContext, useState } from "react";
import { ShopContext } from "../../context/ShopContext";

const CartItems = () => {
  const {
    cartItems,
    all_product,
    removeFromCart,
    addToCart,
    getTotalCartAmount,
  } = useContext(ShopContext);

  const [editableQuantities, setEditableQuantities] = useState({});

  const handleQuantityChange = (id, value) => {
    // Ensure value is a valid number and not less than 1
    const newValue = Math.max(1, parseInt(value) || 1);
    setEditableQuantities({ ...editableQuantities, [id]: newValue });

    // Update cart with the new quantity immediately
    const currentQuantity = cartItems[id];
    if (newValue !== currentQuantity) {
      // If new quantity is greater, add the difference
      if (newValue > currentQuantity) {
        for (let i = 0; i < newValue - currentQuantity; i++) {
          addToCart(id);
        }
      }
      // If new quantity is less, remove the difference
      else if (newValue < currentQuantity) {
        for (let i = 0; i < currentQuantity - newValue; i++) {
          removeFromCart(id);
        }
      }
    }
  };

  const handleQuantityBlur = (id) => {
    // Clear the editable state
    const newEditableQuantities = { ...editableQuantities };
    delete newEditableQuantities[id];
    setEditableQuantities(newEditableQuantities);
  };

  const handleRemoveAll = (id) => {
    // Remove all items of this product
    const quantity = cartItems[id];
    for (let i = 0; i < quantity; i++) {
      removeFromCart(id);
    }
  };

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
          {all_product.map((product) => {
            const { id, image, name, new_price } = product;
            if (cartItems[id] > 0) {
              return (
                <tr key={id}>
                  <td>
                    <img className="cart-product-image" src={image} alt="" />
                  </td>
                  <td>{name}</td>
                  <td>${new_price}</td>
                  <td>
                    <div className="cart-quantity-controls">
                      <button
                        className="cart-quantity-adjust-btn"
                        onClick={() => removeFromCart(id)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="cart-quantity-input"
                        value={
                          editableQuantities[id] !== undefined
                            ? editableQuantities[id]
                            : cartItems[id]
                        }
                        onChange={(event) =>
                          handleQuantityChange(id, event.target.value)
                        }
                        onBlur={() => handleQuantityBlur(id)}
                        min="1"
                      />
                      <button
                        className="cart-quantity-adjust-btn"
                        onClick={() => addToCart(id)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>${new_price * cartItems[id]}</td>
                  <td>
                    <div className="cart-remove-icon-container">
                      <img
                        className="cart-remove-icon"
                        onClick={() => handleRemoveAll(id)}
                        src={remove_icon}
                        alt=""
                        title="Remove all"
                      />
                    </div>
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>

      {/* Cart Totals Section */}
      <div className="cart-totals">
        <h2 className="cart-totals-title">Cart Totals</h2>
        <div className="cart-totals-item">
          <p className="cart-totals-label">Subtotal</p>
          <p className="cart-totals-value">${getTotalCartAmount()}</p>
        </div>
        <div className="cart-totals-item">
          <p className="cart-totals-label">Shipping Fee</p>
          <p className="cart-totals-value">Free</p>
        </div>
        <hr className="cart-divider" />
        <div className="cart-totals-item">
          <p className="cart-totals-label">Total</p>
          <p className="cart-totals-value cart-total-amount">
            ${getTotalCartAmount()}
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

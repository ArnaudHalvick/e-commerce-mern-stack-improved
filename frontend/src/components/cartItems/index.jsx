import "./CartItems.css";
import { CartItem, CartTotals, PromoCodeSection } from "./components";
import useCart from "./hooks/useCart";

/**
 * Cart display component showing all items in cart and totals
 */
const CartItems = () => {
  const {
    items,
    localTotalPrice,
    loading,
    error,
    handleQuantityChange,
    handleQuantityBlur,
    handleRemoveAll,
    handleAddItem,
    handleRemoveItem,
  } = useCart();

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
            <th>Size</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.size}`}
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

      {/* Cart Totals and Promo Code Section */}
      <div>
        <CartTotals totalPrice={localTotalPrice} />
        <PromoCodeSection />
      </div>
    </div>
  );
};

export default CartItems;

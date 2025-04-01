import "./CartItems.css";
import { useContext } from "react";
import { CartItem, CartTotals, PromoCodeSection } from "./components";
import EmailVerificationBanner from "./components/EmailVerificationBanner";
import { AuthContext } from "../../context/AuthContext";
import useCart from "./hooks/useCart";
import EmptyState from "../errorHandling/emptyState/EmptyState";
import "../errorHandling/styles/LoadingIndicator.css";
import Spinner from "../ui/spinner";

/**
 * Cart display component showing all items in cart and totals
 */
const CartItems = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
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

  // Check if we should show the email verification banner
  const showVerificationBanner =
    isAuthenticated && user && !user.isEmailVerified;

  // Display loading message
  if (loading && items.length === 0) {
    return (
      <div className="loading-container">
        <Spinner
          message="Loading your cart..."
          size="medium"
          className="cart-items-page-spinner"
        />
      </div>
    );
  }

  // Display error message if any
  if (error) {
    return (
      <EmptyState
        title="Error Loading Cart"
        message={`We encountered a problem loading your cart. ${error}`}
        icon="⚠️"
        actions={[
          {
            label: "Try Again",
            onClick: () => window.location.reload(),
            type: "primary",
          },
          {
            label: "Continue Shopping",
            to: "/",
            type: "secondary",
          },
        ]}
      />
    );
  }

  // Display empty cart message
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        message="Looks like you haven't added any items to your cart yet. Browse our collection to find something you'll love!"
        icon="🛒"
        actions={[
          {
            label: "Continue Shopping",
            to: "/",
            type: "primary",
          },
          {
            label: "View Offers",
            to: "/offers",
            type: "secondary",
          },
        ]}
      />
    );
  }

  return (
    <div className="cart-items-container">
      {/* Email Verification Banner */}
      {showVerificationBanner && <EmailVerificationBanner />}

      {/* Cart Table */}
      <table className="cart-items-table">
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

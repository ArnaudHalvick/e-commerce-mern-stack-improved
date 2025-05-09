// External Libraries
import { useAuth } from "../../hooks/state";
import { useNavigate } from "react-router-dom";

// Internal Components
import {
  CartItem,
  PromoCodeSection,
  EmailVerificationBanner,
} from "./components";
import EmptyState from "../errorHandling/emptyState/EmptyState";
import Spinner from "../ui/spinner";

// Internal Hooks
import { useCart } from "../../hooks/state";

// Styles
import "./styles/CartItems.css";
import "../errorHandling/styles/LoadingIndicator.css";

/**
 * Cart display component showing all items in cart and totals
 */
const CartItems = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    totalPrice: localTotalPrice,
    loading,
    error,
    updateQuantity,
    removeAllItems,
    addItem,
    removeItem,
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
            to: "/shop",
            type: "secondary",
          },
        ]}
      />
    );
  }

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="cart-items-page">
      {/* Email Verification Banner - Now outside the container */}
      {showVerificationBanner && <EmailVerificationBanner />}

      <div className="cart-items-container">
        {/* Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-items-list">
            <table className="cart-items-table">
              <tbody>
                {items.map((item) => (
                  <CartItem
                    key={`${item.productId}-${item.size}`}
                    item={item}
                    onRemoveItem={removeItem}
                    onAddItem={addItem}
                    onRemoveAll={removeAllItems}
                    onQuantityBlur={updateQuantity}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary-section">
          <div className="cart-summary-header">
            <h2 className="cart-summary-title">Order Summary</h2>
          </div>
          <div className="cart-summary-content">
            <div className="cart-summary-row">
              <span>Products</span>
              <span>${localTotalPrice.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span className="cart-summary-free">Free</span>
            </div>
            <PromoCodeSection />
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${localTotalPrice.toFixed(2)}</span>
            </div>
            <button
              className="cart-summary-checkout-btn"
              onClick={handleCheckout}
              aria-label="Proceed to checkout"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;

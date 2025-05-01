// External Libraries
import { useAuth } from "../../hooks/state";

// Internal Components
import {
  CartItem,
  CartTotals,
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

  return (
    <div className="cart-items-page">
      {/* Email Verification Banner - Now outside the container */}
      {showVerificationBanner && <EmailVerificationBanner />}

      <div className="cart-items-container">
        {/* Cart Table with responsive wrapper */}
        <div className="cart-items-table-responsive">
          <table className="cart-items-table">
            <thead>
              <tr>
                <th data-label="Img">
                  <span className="header-text">Image</span>
                </th>
                <th data-label="Product">
                  <span className="header-text">Product</span>
                </th>
                <th data-label="Price">
                  <span className="header-text">Price</span>
                </th>
                <th data-label="Size">
                  <span className="header-text">Size</span>
                </th>
                <th data-label="Qty">
                  <span className="header-text">Quantity</span>
                </th>
                <th data-label="Total">
                  <span className="header-text">Total</span>
                </th>
                <th data-label="×">
                  <span className="header-text">Remove</span>
                </th>
              </tr>
            </thead>
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

        {/* Cart Totals and Promo Code Section */}
        <div className="cart-summary-section">
          <CartTotals totalPrice={localTotalPrice} />
          <PromoCodeSection />
        </div>
      </div>
    </div>
  );
};

export default CartItems;

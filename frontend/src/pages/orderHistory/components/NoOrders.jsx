import React from "react";
import { Link } from "react-router-dom";

/**
 * Component to display when user has no orders
 */
const NoOrders = () => {
  return (
    <div className="order-no-orders">
      <div className="order-no-orders-icon">🛍️</div>
      <h3 className="order-no-orders-title">No Orders Yet</h3>
      <p className="order-no-orders-text">
        You haven't placed any orders yet. Start shopping to see your order
        history here.
      </p>
      <Link to="/shop">
        <button className="order-no-orders-btn" aria-label="Browse products">
          Start Shopping
        </button>
      </Link>
    </div>
  );
};

export default NoOrders;

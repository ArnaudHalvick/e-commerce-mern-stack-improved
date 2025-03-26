import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getOrderById } from "../../services/paymentService";
import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have order details passed via location state, use those
    if (location.state?.orderDetails) {
      setOrder(location.state.orderDetails);
      setLoading(false);
      return;
    }

    // Otherwise fetch the order
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data.order);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.state]);

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/account/orders" className="button">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>The order you're looking for could not be found.</p>
          <Link to="/account/orders" className="button">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="order-confirmation-page">
      <div className="success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>

      <h1>Thank You For Your Order!</h1>
      <p className="order-id">Order #{order._id}</p>
      <p className="order-date">Placed on {formatDate(order.createdAt)}</p>

      <div className="order-details-container">
        <div className="order-details-section">
          <h2>Order Summary</h2>
          <div className="order-summary">
            <div className="summary-row">
              <span>Items Total:</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>${order.shippingAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-details-section">
          <h2>Shipping Information</h2>
          <div className="shipping-info">
            <p>{order.shippingInfo.address}</p>
            <p>
              {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
              {order.shippingInfo.postalCode}
            </p>
            <p>{order.shippingInfo.country}</p>
            <p>Phone: {order.shippingInfo.phoneNumber}</p>
          </div>
        </div>

        <div className="order-details-section">
          <h2>Payment Information</h2>
          <div className="payment-info">
            <div className="payment-row">
              <span>Method:</span>
              <span>Credit Card ({order.paymentInfo.paymentMethod})</span>
            </div>
            <div className="payment-row">
              <span>Status:</span>
              <span className="payment-status success">
                {order.paymentInfo.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2>Order Items</h2>
      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item" key={item._id || item.productId}>
            <div className="item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-size">Size: {item.size}</p>
              <p className="item-quantity">Quantity: {item.quantity}</p>
            </div>
            <div className="item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="order-status-container">
        <h2>Order Status</h2>
        <div className="order-status">
          <div
            className={`status-step ${
              order.orderStatus === "Processing" ||
              order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered"
                ? "active"
                : ""
            }`}
          >
            <div className="status-icon">1</div>
            <div className="status-text">Processing</div>
          </div>
          <div className="status-line"></div>
          <div
            className={`status-step ${
              order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered"
                ? "active"
                : ""
            }`}
          >
            <div className="status-icon">2</div>
            <div className="status-text">Shipped</div>
          </div>
          <div className="status-line"></div>
          <div
            className={`status-step ${
              order.orderStatus === "Delivered" ? "active" : ""
            }`}
          >
            <div className="status-icon">3</div>
            <div className="status-text">Delivered</div>
          </div>
        </div>
      </div>

      <div className="actions">
        <Link to="/account/orders" className="button secondary">
          View All Orders
        </Link>
        <Link to="/shop" className="button primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

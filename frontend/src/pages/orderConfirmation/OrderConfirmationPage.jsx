import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { paymentsService } from "../../api";
import Spinner from "../../components/ui/spinner";
import { FormSubmitButton } from "../../components/form";
import { getImageUrl } from "../../utils/imageUtils";
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
        const data = await paymentsService.getOrderDetails(orderId);
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
        <div className="order-confirmation-loading-spinner">
          <Spinner message="Loading order details..." size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/account/orders">
            <FormSubmitButton
              text="View All Orders"
              type="button"
              onClick={() => {}}
              variant="secondary"
            />
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-error-message">
          <h2>Order Not Found</h2>
          <p>The order you're looking for could not be found.</p>
          <Link to="/account/orders">
            <FormSubmitButton
              text="View All Orders"
              type="button"
              onClick={() => {}}
              variant="secondary"
            />
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
      <div className="order-confirmation-success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>

      <h1>Thank You For Your Order!</h1>
      <p className="order-confirmation-id">Order #{order._id}</p>
      <p className="order-confirmation-date">
        Placed on {formatDate(order.createdAt)}
      </p>

      <div className="order-confirmation-details-container">
        <div className="order-confirmation-section">
          <h2>Order Summary</h2>
          <div className="order-confirmation-summary">
            <div className="order-confirmation-summary-row">
              <span>Items Total:</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-summary-row">
              <span>Shipping:</span>
              <span>${order.shippingAmount.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-summary-row">
              <span>Tax:</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="order-confirmation-summary-row order-confirmation-total">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-confirmation-section">
          <h2>Shipping Information</h2>
          <div className="order-confirmation-shipping-info">
            <p>{order.shippingInfo.address}</p>
            <p>
              {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
              {order.shippingInfo.postalCode}
            </p>
            <p>{order.shippingInfo.country}</p>
            <p>Phone: {order.shippingInfo.phoneNumber}</p>
          </div>
        </div>

        <div className="order-confirmation-section">
          <h2>Payment Information</h2>
          <div className="order-confirmation-payment-info">
            <div className="order-confirmation-payment-row">
              <span>Method:</span>
              <span>Credit Card ({order.paymentInfo.paymentMethod})</span>
            </div>
            <div className="order-confirmation-payment-row">
              <span>Status:</span>
              <span className="order-confirmation-payment-status order-confirmation-status-success">
                {order.paymentInfo.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2>Order Items</h2>
      <div className="order-confirmation-items">
        {order.items.map((item) => (
          <div
            className="order-confirmation-item"
            key={item._id || item.productId}
          >
            <div className="order-confirmation-item-image">
              <img src={getImageUrl(item.image)} alt={item.name} />
            </div>
            <div className="order-confirmation-item-details">
              <h3>{item.name}</h3>
              <p className="order-confirmation-item-size">Size: {item.size}</p>
              <p className="order-confirmation-item-quantity">
                Quantity: {item.quantity}
              </p>
            </div>
            <div className="order-confirmation-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="order-confirmation-status-container">
        <h2>Order Status</h2>
        <div className="order-confirmation-status">
          <div
            className={`order-confirmation-status-step ${
              order.orderStatus === "Processing" ||
              order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered"
                ? "active"
                : ""
            }`}
          >
            <div className="order-confirmation-status-icon">1</div>
            <div className="order-confirmation-status-text">Processing</div>
          </div>
          <div className="order-confirmation-status-line"></div>
          <div
            className={`order-confirmation-status-step ${
              order.orderStatus === "Shipped" ||
              order.orderStatus === "Delivered"
                ? "active"
                : ""
            }`}
          >
            <div className="order-confirmation-status-icon">2</div>
            <div className="order-confirmation-status-text">Shipped</div>
          </div>
          <div className="order-confirmation-status-line"></div>
          <div
            className={`order-confirmation-status-step ${
              order.orderStatus === "Delivered" ? "active" : ""
            }`}
          >
            <div className="order-confirmation-status-icon">3</div>
            <div className="order-confirmation-status-text">Delivered</div>
          </div>
        </div>
      </div>

      <div className="order-confirmation-actions">
        <Link to="/account/orders">
          <FormSubmitButton
            text="View All Orders"
            type="button"
            onClick={() => {}}
            variant="secondary"
          />
        </Link>
        <Link to="/offers">
          <FormSubmitButton
            text="Continue Shopping"
            type="button"
            onClick={() => {}}
            variant="primary"
          />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

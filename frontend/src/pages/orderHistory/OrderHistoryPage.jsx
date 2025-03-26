import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../services/paymentService";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(data.orders);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Processing":
        return "status-processing";
      case "Shipped":
        return "status-shipped";
      case "Delivered":
        return "status-delivered";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-processing";
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="button">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <h1>Order History</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              <path d="M14 9h-4v2h4V9zm2 4H8v2h8v-2z" />
            </svg>
          </div>
          <h2>No Orders Yet</h2>
          <p>
            You haven't placed any orders yet. Start shopping to see your order
            history here.
          </p>
          <Link to="/shop" className="button primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <div className="order-header-left">
                  <h2>Order #{order._id}</h2>
                  <p className="order-date">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="order-header-right">
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, index) => (
                  <div className="order-item-preview" key={index}>
                    <div className="item-preview-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-preview-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-details">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {order.items.length > 3 && (
                  <div className="more-items">
                    +{order.items.length - 3} more item(s)
                  </div>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-price">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <Link
                  to={`/order-confirmation/${order._id}`}
                  className="view-details-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;

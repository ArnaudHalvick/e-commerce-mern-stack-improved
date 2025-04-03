import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentsService } from "../../api";
import Spinner from "../../components/ui/spinner";
import { FormSubmitButton } from "../../components/form";
import { getImageUrl } from "../../utils/imageUtils";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import "./OrderHistoryPage.css";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await paymentsService.getMyOrders();
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
        return "order-history-status-processing";
      case "Shipped":
        return "order-history-status-shipped";
      case "Delivered":
        return "order-history-status-delivered";
      case "Cancelled":
        return "order-history-status-cancelled";
      default:
        return "order-history-status-processing";
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="order-history-loading-spinner">
          <Spinner message="Loading your orders..." size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <div className="order-history-error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/">
            <FormSubmitButton
              text="Return to Home"
              type="button"
              onClick={() => {}}
              variant="secondary"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {" "}
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Order History" }]}
      />
      <div className="order-history-page">
        <h1>Order History</h1>

        {orders.length === 0 ? (
          <div className="order-history-no-orders">
            <div className="order-history-empty-icon">
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
              You haven't placed any orders yet. Start shopping to see your
              order history here.
            </p>
            <Link to="/offers">
              <FormSubmitButton
                text="Start Shopping"
                type="button"
                onClick={() => {}}
                variant="primary"
              />
            </Link>
          </div>
        ) : (
          <div className="order-history-container">
            {orders.map((order) => (
              <div className="order-history-card" key={order._id}>
                <div className="order-history-header">
                  <div className="order-history-header-left">
                    <h2>Order #{order._id}</h2>
                    <p className="order-history-date">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-history-header-right">
                    <span
                      className={`order-history-status-badge ${getStatusBadgeClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="order-history-items-preview">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div className="order-history-item-preview" key={index}>
                      <div className="order-history-item-image">
                        <img src={getImageUrl(item.image)} alt={item.name} />
                      </div>
                      <div className="order-history-item-info">
                        <p className="order-history-item-name">{item.name}</p>
                        <p className="order-history-item-details">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.items.length > 3 && (
                    <div className="order-history-more-items">
                      +{order.items.length - 3} more item(s)
                    </div>
                  )}
                </div>

                <div className="order-history-footer">
                  <div className="order-history-total">
                    <span>Total:</span>
                    <span className="order-history-total-price">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Link to={`/order-confirmation/${order._id}`}>
                    <FormSubmitButton
                      text="View Details"
                      type="button"
                      onClick={() => {}}
                      variant="primary"
                      size="small"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;

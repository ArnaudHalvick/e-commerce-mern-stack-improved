import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";
import OrderStatusBadge from "./OrderStatusBadge";
import { useOrderFormatting } from "../hooks";

/**
 * Component to display a single order card with details
 *
 * @param {Object} props
 * @param {Object} props.order - The order data object
 */
const OrderCard = ({ order }) => {
  const { formatDate } = useOrderFormatting();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.location.href = `/order-confirmation/${order._id}`;
    }
  };

  return (
    <div
      className="order-history-card"
      key={order._id}
      tabIndex="0"
      aria-label={`Order ${order._id} placed on ${formatDate(order.createdAt)}`}
      onKeyDown={handleKeyDown}
    >
      <div className="order-history-header">
        <div className="order-history-header-left">
          <h2>Order #{order._id}</h2>
          <p className="order-history-date">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="order-history-header-right">
          <OrderStatusBadge status={order.orderStatus} />
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
        <Link
          to={`/order-confirmation/${order._id}`}
          className="order-history-view-btn"
          aria-label={`View details for order ${order._id}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;

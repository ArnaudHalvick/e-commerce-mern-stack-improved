import React from "react";
import OrderCard from "./OrderCard";
import NoOrders from "./NoOrders";

/**
 * Component to display a list of orders or an empty state message
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects
 */
const OrderList = ({ orders }) => {
  if (orders.length === 0) {
    return <NoOrders />;
  }

  return (
    <div className="order-history-container">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default OrderList;

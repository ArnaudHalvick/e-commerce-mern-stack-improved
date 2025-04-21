import React from "react";
import { EmptyState } from "../../../components/errorHandling";

/**
 * Component to display when user has no orders
 */
const NoOrders = () => {
  return (
    <EmptyState
      title="No Orders Yet"
      message="You haven't placed any orders yet. Start shopping to see your order history here."
      icon="🛍️"
      className="order-history-no-orders"
      actions={[
        {
          label: "Start Shopping",
          to: "/shop",
          type: "primary",
        },
      ]}
    />
  );
};

export default NoOrders;

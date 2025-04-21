import React from "react";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { useOrderHistory } from "./hooks";
import { OrderList, LoadingState, ErrorState } from "./components";
import "./styles/index.css";

/**
 * Order History Page Component
 * Shows the user's past orders and their status
 */
const OrderHistoryPage = () => {
  const { orders, loading, error, refreshOrders } = useOrderHistory();

  return (
    <>
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Order History" }]}
      />
      <div className="order-history-page">
        <h1 className="order-history-page-title">Order History</h1>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState errorMessage={error} retryHandler={refreshOrders} />
        ) : (
          <OrderList orders={orders} />
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;

import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Spinner from "../../components/ui/spinner";
import { FormSubmitButton } from "../../components/form";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { EmptyState } from "../../components/errorHandling";
import { useOrderDetails } from "./hooks";
import {
  OrderHeader,
  OrderSummary,
  ShippingInfo,
  PaymentInfo,
  OrderItems,
  OrderStatus,
} from "./components";
import "./styles/index.css";

// Debug component to show order data
const DebugInfo = ({ orderId, order, error }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          background: "none",
          border: "none",
          color: "#999",
          fontSize: "12px",
          padding: "5px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Show diagnostic info
      </button>
    );
  }

  return (
    <div
      style={{
        padding: "10px",
        margin: "10px 0",
        background: "#f5f5f5",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
      }}
    >
      <div>
        <strong>Order ID parameter:</strong> {orderId}
      </div>
      <div>
        <strong>Is Payment Intent:</strong>{" "}
        {orderId?.startsWith("pi_") ? "Yes" : "No"}
      </div>
      <div>
        <strong>Error:</strong> {error || "None"}
      </div>
      <div>
        <strong>Order loaded:</strong> {order ? "Yes" : "No"}
      </div>
      {order && (
        <pre style={{ maxHeight: "200px", overflow: "auto" }}>
          {JSON.stringify(order, null, 2)}
        </pre>
      )}
      <button
        onClick={() => setShowDebug(false)}
        style={{
          background: "#ddd",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        Hide diagnostic info
      </button>
    </div>
  );
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const initialOrderDetails = location.state?.orderDetails || null;
  const { order, loading, error } = useOrderDetails(
    orderId,
    initialOrderDetails
  );

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
        <EmptyState
          title="Error"
          message={error}
          icon="⚠️"
          className="order-confirmation-error"
          actions={[
            {
              label: "View All Orders",
              to: "/account/orders",
              type: "secondary",
            },
          ]}
        />
        <DebugInfo orderId={orderId} error={error} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <EmptyState
          title="Order Not Found"
          message="The order you're looking for could not be found."
          icon="🔍"
          className="order-confirmation-not-found"
          actions={[
            {
              label: "View All Orders",
              to: "/account/orders",
              type: "secondary",
            },
          ]}
        />
        <DebugInfo orderId={orderId} />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        routes={[
          { label: "Home", path: "/" },
          { label: "Order History", path: "/account/orders" },
          { label: "Order Details" },
        ]}
      />
      <div className="order-confirmation-page">
        <OrderHeader orderId={order._id} createdAt={order.createdAt} />

        <div className="order-confirmation-details-container">
          <OrderSummary order={order} />
          <ShippingInfo shippingInfo={order.shippingInfo} />
          <PaymentInfo paymentInfo={order.paymentInfo} />
        </div>

        <OrderItems items={order.items} />
        <OrderStatus orderStatus={order.orderStatus} />

        <div className="order-confirmation-actions">
          <Link to="/account/orders">
            <FormSubmitButton
              text="View All Orders"
              type="button"
              onClick={() => {}}
              variant="secondary"
            />
          </Link>
          <Link to="/">
            <FormSubmitButton
              text="Continue Shopping"
              type="button"
              onClick={() => {}}
              variant="primary"
            />
          </Link>
        </div>

        <DebugInfo orderId={orderId} order={order} />
      </div>
    </>
  );
};

export default OrderConfirmationPage;

import React from "react";
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
import "./OrderConfirmationPage.css";

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
      <EmptyState
        title="Error"
        message={error}
        icon="⚠️"
        className="order-confirmation-page"
        actions={[
          {
            label: "View All Orders",
            to: "/account/orders",
            type: "secondary",
          },
        ]}
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        message="The order you're looking for could not be found."
        icon="🔍"
        className="order-confirmation-page"
        actions={[
          {
            label: "View All Orders",
            to: "/account/orders",
            type: "secondary",
          },
        ]}
      />
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
      </div>
    </>
  );
};

export default OrderConfirmationPage;

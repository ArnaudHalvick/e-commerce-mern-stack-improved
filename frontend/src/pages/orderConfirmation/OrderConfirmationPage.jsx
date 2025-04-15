import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Spinner from "../../components/ui/spinner";
import { FormSubmitButton } from "../../components/form";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { useOrderDetails } from "./hooks";
import {
  OrderHeader,
  OrderSummary,
  ShippingInfo,
  PaymentInfo,
  OrderItems,
  OrderStatus,
  ErrorState,
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
    return <ErrorState error={error} />;
  }

  if (!order) {
    return <ErrorState isNotFound={true} />;
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

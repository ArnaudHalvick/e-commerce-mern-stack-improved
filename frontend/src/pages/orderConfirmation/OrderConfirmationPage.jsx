import React, { useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Spinner from "../../components/ui/spinner";
import { FormSubmitButton } from "../../components/ui";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { EmptyState } from "../../components/errorHandling";
import { useOrderDetails } from "./hooks";
import { clearError } from "../../redux/slices/cartSlice";
import {
  OrderHeader,
  OrderSummary,
  ShippingInfo,
  PaymentInfo,
  OrderItems,
  OrderStatus,
} from "./components";
import "./styles/index.css";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const initialOrderDetails = location.state?.orderDetails || null;
  const { order, loading, error } = useOrderDetails(
    orderId,
    initialOrderDetails
  );

  useEffect(() => {
    if (location.search.includes("cartError")) {
      window.history.replaceState({}, "", location.pathname);
    }

    dispatch(clearError());
  }, [dispatch, location]);

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
      </div>
    </>
  );
};

export default OrderConfirmationPage;

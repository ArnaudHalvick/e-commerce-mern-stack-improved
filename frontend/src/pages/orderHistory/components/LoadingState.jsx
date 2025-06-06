import React from "react";
import Spinner from "../../../components/ui/spinner";

/**
 * Component to display a loading state while fetching orders
 *
 * @param {Object} props
 * @param {String} props.message - Optional custom loading message
 */
const LoadingState = ({ message = "Loading your orders..." }) => {
  return (
    <div className="order-loading-wrapper">
      <Spinner
        message={message}
        size="large"
        showAnimation={true}
        showMessage={true}
      />
    </div>
  );
};

export default LoadingState;

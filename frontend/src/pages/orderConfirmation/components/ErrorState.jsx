import React from "react";
import { Link } from "react-router-dom";
import { FormSubmitButton } from "../../../components/form";

const ErrorState = ({ error, isNotFound = false }) => {
  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-error-message">
        <h2>{isNotFound ? "Order Not Found" : "Error"}</h2>
        <p>
          {isNotFound
            ? "The order you're looking for could not be found."
            : error}
        </p>
        <Link to="/account/orders">
          <FormSubmitButton
            text="View All Orders"
            type="button"
            onClick={() => {}}
            variant="secondary"
          />
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;

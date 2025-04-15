import React from "react";
import { getImageUrl } from "../../../utils/imageUtils";

const OrderItems = ({ items }) => {
  return (
    <>
      <h2 className="order-confirmation-section-title">Order Items</h2>
      <div className="order-confirmation-items">
        {items.map((item) => (
          <div
            className="order-confirmation-item"
            key={item._id || item.productId}
          >
            <div className="order-confirmation-item-image">
              <img
                className="order-confirmation-item-img"
                src={getImageUrl(item.image)}
                alt={item.name}
              />
            </div>
            <div className="order-confirmation-item-details">
              <h3 className="order-confirmation-item-name">{item.name}</h3>
              <p className="order-confirmation-item-size">Size: {item.size}</p>
              <p className="order-confirmation-item-quantity">
                Quantity: {item.quantity}
              </p>
            </div>
            <div className="order-confirmation-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderItems;

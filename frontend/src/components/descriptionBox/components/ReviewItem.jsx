import React from "react";
import ReviewStars from "./ReviewStars";
import { formatDate } from "../utils/formatDate";
import "./ReviewItem.css";

/**
 * Display a single review item
 * @param {object} props - Component props
 * @param {object} props.review - Review object
 * @returns {JSX.Element} - Review item component
 */
const ReviewItem = ({ review }) => {
  return (
    <div className="description-box-review-item">
      <div className="description-box-review-header">
        <div className="description-box-review-user-info">
          <div className="description-box-review-avatar">
            <div className="description-box-review-default-avatar">
              {review.user?.name?.charAt(0) || "?"}
            </div>
          </div>
          <div className="description-box-review-user-details">
            <p className="description-box-review-user-name">
              {review.user?.name || "Anonymous"}
            </p>
            <p className="description-box-review-date">
              {formatDate(review.date)}
            </p>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>

      <div className="description-box-review-content">
        <p className="description-box-review-content-text">{review.content}</p>
      </div>

      {review.verifiedPurchase && (
        <div className="description-box-review-verified-badge">
          <span className="description-box-review-verified-badge-check">✓</span>{" "}
          Verified Purchase
        </div>
      )}
    </div>
  );
};

export default ReviewItem;

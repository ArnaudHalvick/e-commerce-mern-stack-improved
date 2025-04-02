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
    <div className="review-item">
      <div className="review-header">
        <div className="review-user-info">
          <div className="review-avatar">
            <div className="default-avatar">
              {review.user?.name?.charAt(0) || "?"}
            </div>
          </div>
          <div className="review-user-details">
            <p className="review-user-name">
              {review.user?.name || "Anonymous"}
            </p>
            <p className="review-date">{formatDate(review.date)}</p>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>

      <div className="review-content">
        <p className="review-content-text">{review.content}</p>
      </div>

      {review.verifiedPurchase && (
        <div className="verified-badge">
          <span className="verified-badge-check">✓</span> Verified Purchase
        </div>
      )}
    </div>
  );
};

export default ReviewItem;

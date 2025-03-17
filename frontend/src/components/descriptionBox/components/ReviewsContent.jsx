import React from "react";
import { useDispatch } from "react-redux";
import ReviewItem from "./ReviewItem";
import { openReviewModal } from "../../../redux/slices/reviewsSlice";

/**
 * Component for the reviews tab content
 * @param {object} props - Component props
 * @param {object} props.product - Product object
 * @param {Array} props.reviews - List of review objects
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message, if any
 * @param {number} props.totalReviews - Total number of reviews
 * @returns {JSX.Element} - Reviews content component
 */
const ReviewsContent = ({ reviews, loading, error, reviewCount }) => {
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(openReviewModal());
  };

  return (
    <div className="custom-reviews-content">
      <div className="reviews-header">
        <h2 className="reviews-header-title">Customer Reviews</h2>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="reviews-loading">Loading reviews...</p>}
      {error && <p className="reviews-error">Error: {error}</p>}

      {/* Empty State */}
      {!loading && !error && reviews.length === 0 && (
        <p className="no-reviews">
          No reviews yet. Be the first to review this product!
        </p>
      )}

      {/* Top Reviews List */}
      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* See All Reviews Button */}
      {!loading && !error && reviews.length > 0 && reviewCount > 5 && (
        <div className="see-all-reviews">
          <button className="see-all-button" onClick={handleOpenModal}>
            See All Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsContent;

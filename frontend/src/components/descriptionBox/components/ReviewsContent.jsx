import React from "react";
import { useDispatch } from "react-redux";
import ReviewItem from "./ReviewItem";
import { openReviewModal } from "../../../redux/slices/reviewsSlice";
import "./ReviewsContent.css";

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
    <div className="description-box-reviews-content">
      <div className="description-box-reviews-header">
        <h2 className="description-box-reviews-header-title">Latest Reviews</h2>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <p className="description-box-reviews-loading">Loading reviews...</p>
      )}
      {error && <p className="description-box-reviews-error">Error: {error}</p>}

      {/* Empty State */}
      {!loading && !error && reviews.length === 0 && (
        <p className="description-box-reviews-none">
          No reviews yet. Be the first to review this product!
        </p>
      )}

      {/* Latest Reviews List */}
      {!loading && !error && reviews.length > 0 && (
        <div className="description-box-reviews-list">
          {reviews.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* See All Reviews Button */}
      {!loading && !error && reviewCount > 5 && (
        <div className="description-box-reviews-see-all">
          <button
            className="description-box-reviews-see-all-button"
            onClick={handleOpenModal}
          >
            See All Reviews ({reviewCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsContent;

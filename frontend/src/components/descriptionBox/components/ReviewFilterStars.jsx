import React from "react";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";
import "./ReviewFilterStars.css";

/**
 * Component for filtering reviews by star rating
 * @param {object} props - Component props
 * @param {number} props.ratingFilter - Current rating filter value
 * @param {object} props.ratingCounts - Object containing counts for each rating
 * @param {function} props.onRatingFilter - Function to call when filter is changed
 * @returns {JSX.Element} - Rating filter component
 */
const ReviewFilterStars = ({ ratingFilter, ratingCounts, onRatingFilter }) => {
  // Ensure we have valid rating counts or default to zeros
  const ensureValidCounts = () => {
    if (!ratingCounts || typeof ratingCounts !== "object") {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }

    // Ensure each rating has a count (even if it's 0)
    return {
      1: parseInt(ratingCounts[1]) || 0,
      2: parseInt(ratingCounts[2]) || 0,
      3: parseInt(ratingCounts[3]) || 0,
      4: parseInt(ratingCounts[4]) || 0,
      5: parseInt(ratingCounts[5]) || 0,
    };
  };

  const counts = ensureValidCounts();

  // Handler for keyboard events
  const handleKeyDown = (e, rating) => {
    if (e.key === "Enter" || e.key === " ") {
      onRatingFilter(rating);
      e.preventDefault();
    }
  };

  // Render star images for a rating
  const renderStars = (rating) => {
    const stars = [];

    // Filled stars
    for (let i = 0; i < rating; i++) {
      stars.push(
        <img
          key={`filled-${i}`}
          src={star_icon}
          alt="star"
          className="description-box-filter-star"
        />
      );
    }

    // Empty stars
    for (let i = rating; i < 5; i++) {
      stars.push(
        <img
          key={`empty-${i}`}
          src={star_dull_icon}
          alt="star"
          className="description-box-filter-star"
        />
      );
    }

    return stars;
  };

  return (
    <div className="description-box-filter-ratings-row">
      {[5, 4, 3, 2, 1].map((rating) => {
        const isActive = ratingFilter === rating;
        return (
          <div
            key={rating}
            className={`description-box-filter-rating-item ${
              isActive ? "active" : ""
            }`}
            onClick={() => onRatingFilter(rating)}
            aria-label={`Filter by ${rating} star reviews`}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, rating)}
          >
            <div className="description-box-filter-star-row">
              {renderStars(rating)}
            </div>
            <span
              className="description-box-filter-rating-count"
              data-rating={rating}
            >
              ({counts[rating]})
            </span>
          </div>
        );
      })}
      {ratingFilter > 0 && (
        <button
          className="description-box-filter-clear-btn"
          onClick={() => onRatingFilter(0)}
          aria-label="Clear rating filter"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ReviewFilterStars;

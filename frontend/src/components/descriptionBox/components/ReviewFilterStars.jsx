import React from "react";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";

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

  // Check if we have any valid counts to display
  const hasValidCounts = Object.values(counts).some((count) => count > 0);

  if (!hasValidCounts) {
    console.warn("No valid review counts available");
  } else {
    console.log("Display counts:", counts);
  }

  return (
    <div className="rating-filters-row">
      {[5, 4, 3, 2, 1].map((rating) => {
        const isActive = ratingFilter === rating;
        return (
          <div
            key={rating}
            className={`rating-filter-compact ${isActive ? "active" : ""}`}
            onClick={() => onRatingFilter(rating)}
            aria-label={`Filter by ${rating} star reviews`}
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onRatingFilter(rating);
                e.preventDefault();
              }
            }}
          >
            <div className="filter-star-row">
              {Array(rating)
                .fill()
                .map((_, index) => (
                  <img
                    key={index}
                    src={star_icon}
                    alt="star"
                    className="filter-star"
                  />
                ))}
              {Array(5 - rating)
                .fill()
                .map((_, index) => (
                  <img
                    key={index + rating}
                    src={star_dull_icon}
                    alt="star"
                    className="filter-star"
                  />
                ))}
              {isActive && (
                <span className="active-filter-indicator" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
            <span className="rating-count" data-rating={rating}>
              ({counts[rating]})
            </span>
          </div>
        );
      })}
      {ratingFilter > 0 && (
        <button
          className="description-clear-filter-btn"
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

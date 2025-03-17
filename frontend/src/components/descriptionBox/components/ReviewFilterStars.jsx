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
  // Make sure ratingCounts is an object and has expected properties
  const counts = ratingCounts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Debug log to verify counts
  console.log("Rating counts in component:", counts);

  return (
    <div className="rating-filters-row">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div
          key={rating}
          className={`rating-filter-compact ${
            ratingFilter === rating ? "active" : ""
          }`}
          onClick={() => onRatingFilter(rating)}
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
          </div>
          <span className="rating-count">
            ({counts[rating] !== undefined ? counts[rating] : 0})
          </span>
        </div>
      ))}
      {ratingFilter > 0 && (
        <button
          className="description-clear-filter-btn"
          onClick={() => onRatingFilter(0)}
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ReviewFilterStars;

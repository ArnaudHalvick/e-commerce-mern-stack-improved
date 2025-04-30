import React from "react";

/**
 * RatingFilter component displays rating filtering options
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element} RatingFilter component
 */
const RatingFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-sidebar-section filter-sidebar-rating-section">
      <h4 className="filter-sidebar-section-subtitle">Rating</h4>
      <div className="filter-sidebar-options rating-filter-options">
        <div className="filter-sidebar-rating-filter">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`filter-sidebar-star-rating ${
                filters.rating === star ? "active" : ""
              }`}
              onClick={() =>
                onFilterChange("rating", filters.rating === star ? 0 : star)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFilterChange("rating", filters.rating === star ? 0 : star);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={filters.rating === star}
              aria-label={`${star} star rating and up`}
            >
              {star}★{" "}
              <span className="filter-sidebar-rating-up-text">& Up</span>{" "}
              {filters.rating === star && "✓"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingFilter;

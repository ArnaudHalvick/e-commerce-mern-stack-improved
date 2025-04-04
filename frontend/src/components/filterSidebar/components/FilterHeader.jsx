import React from "react";

/**
 * FilterHeader component displays the filter title and clear button
 * @param {Object} props - Component props
 * @param {Function} props.onClearAllFilters - Function to clear all filters
 * @returns {JSX.Element} FilterHeader component
 */
const FilterHeader = ({ onClearAllFilters }) => {
  return (
    <div className="filter-sidebar-section">
      <h3 className="filter-sidebar-section-title">
        Filters
        <button
          className="filter-sidebar-clear-btn"
          onClick={onClearAllFilters}
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </h3>
    </div>
  );
};

export default FilterHeader;

import React from "react";

/**
 * CategoryFilter component displays category filtering options
 * @param {Object} props - Component props
 * @param {Array} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element} CategoryFilter component
 */
const CategoryFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-sidebar-section">
      <h4 className="filter-sidebar-section-subtitle">Category</h4>
      <div className="filter-sidebar-options">
        {["men", "women", "kids"].map((category) => (
          <label key={category} className="filter-sidebar-checkbox">
            <input
              type="checkbox"
              className="filter-sidebar-checkbox-input"
              checked={filters.category.includes(category)}
              onChange={() => onFilterChange("category", category)}
            />
            <span className="filter-sidebar-checkmark"></span>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;

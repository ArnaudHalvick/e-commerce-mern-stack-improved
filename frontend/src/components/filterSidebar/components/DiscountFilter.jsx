import React from "react";

/**
 * DiscountFilter component displays discount filtering option
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element} DiscountFilter component
 */
const DiscountFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-sidebar-section filter-sidebar-discount-section">
      <h4 className="filter-sidebar-section-subtitle">Discount</h4>
      <div className="filter-sidebar-options discount-filter-options">
        <label className="filter-sidebar-checkbox-label">
          <input
            type="checkbox"
            className="filter-sidebar-checkbox-input"
            checked={filters.discount}
            onChange={onFilterChange}
          />
          <span className="filter-sidebar-checkmark"></span>
          Discounted Items Only
        </label>
      </div>
    </div>
  );
};

export default DiscountFilter;

import React from "react";

/**
 * PriceFilter component displays price range filtering options
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element} PriceFilter component
 */
const PriceFilter = ({ filters, onFilterChange }) => {
  return (
    <div className="filter-sidebar-section filter-sidebar-price-section">
      <h4 className="filter-sidebar-section-subtitle">Price Range</h4>
      <div className="filter-sidebar-options price-filter-options">
        <div className="filter-sidebar-price-inputs">
          <input
            type="number"
            className="filter-sidebar-price-field"
            min="0"
            max={filters.price.max}
            value={filters.price.min}
            onChange={(e) =>
              onFilterChange("price", {
                ...filters.price,
                min: Number(e.target.value),
              })
            }
            placeholder="Min"
            aria-label="Minimum price"
          />
          <span className="filter-sidebar-price-separator">-</span>
          <input
            type="number"
            className="filter-sidebar-price-field"
            min={filters.price.min}
            value={filters.price.max}
            onChange={(e) =>
              onFilterChange("price", {
                ...filters.price,
                max: Number(e.target.value),
              })
            }
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;

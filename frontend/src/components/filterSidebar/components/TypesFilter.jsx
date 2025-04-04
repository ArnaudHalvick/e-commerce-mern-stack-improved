import React from "react";

/**
 * TypesFilter component displays product types filtering options
 * @param {Object} props - Component props
 * @param {Array} props.availableTypes - List of available product types
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element|null} TypesFilter component or null if no types available
 */
const TypesFilter = ({ availableTypes, filters, onFilterChange }) => {
  if (!availableTypes.length) {
    return null;
  }

  return (
    <div className="filter-sidebar-section">
      <h4 className="filter-sidebar-section-subtitle">Product Types</h4>
      <div className="filter-sidebar-options">
        {availableTypes.map((type) => (
          <label key={type} className="filter-sidebar-checkbox">
            <input
              type="checkbox"
              className="filter-sidebar-checkbox-input"
              checked={filters.types.includes(type)}
              onChange={() => onFilterChange("type", type)}
            />
            <span className="filter-sidebar-checkmark"></span>
            {type}
          </label>
        ))}
      </div>
    </div>
  );
};

export default TypesFilter;

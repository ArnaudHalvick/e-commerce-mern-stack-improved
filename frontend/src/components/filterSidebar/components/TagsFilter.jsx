import React from "react";

/**
 * TagsFilter component displays tags filtering options
 * @param {Object} props - Component props
 * @param {Array} props.availableTags - List of available tags
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @returns {JSX.Element|null} TagsFilter component or null if no tags available
 */
const TagsFilter = ({ availableTags, filters, onFilterChange }) => {
  if (!availableTags.length) {
    return null;
  }

  return (
    <div className="filter-sidebar-section">
      <h4 className="filter-sidebar-section-subtitle">Tags</h4>
      <div className="filter-sidebar-options">
        {availableTags.map((tag) => (
          <label key={tag} className="filter-sidebar-checkbox">
            <input
              type="checkbox"
              className="filter-sidebar-checkbox-input"
              checked={filters.tags.includes(tag)}
              onChange={() => onFilterChange("tag", tag)}
            />
            <span className="filter-sidebar-checkmark"></span>
            {tag}
          </label>
        ))}
      </div>
    </div>
  );
};

export default TagsFilter;

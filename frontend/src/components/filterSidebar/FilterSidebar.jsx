import React, { memo, useCallback } from "react";
import "./FilterSidebar.css";

/**
 * FilterSidebar component displays filtering options for products
 * Optimized to prevent unnecessary re-renders
 */
const FilterSidebar = ({
  filters,
  availableTags,
  availableTypes,
  handleFilterChange,
  clearAllFilters,
  showCategoryFilter = true, // Controls category filter visibility
}) => {
  // Create memoized handlers to avoid re-creation on each render
  const onFilterChange = useCallback(
    (filterType, value) => {
      handleFilterChange(filterType, value);
    },
    [handleFilterChange]
  );

  const onClearAllFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  return (
    <div className="filtersidebar">
      <div className="filtersidebar-section">
        <h3 className="filtersidebar-section-title">
          Filters
          <button
            className="filtersidebar-clear-btn"
            onClick={onClearAllFilters}
          >
            Clear All
          </button>
        </h3>
      </div>

      {/* Category Filter - Only show if showCategoryFilter is true */}
      {showCategoryFilter && (
        <div className="filtersidebar-section">
          <h4 className="filtersidebar-section-subtitle">Category</h4>
          <div className="filtersidebar-options">
            {["men", "women", "kids"].map((category) => (
              <label key={category} className="filtersidebar-checkbox">
                <input
                  type="checkbox"
                  className="filtersidebar-checkbox-input"
                  checked={filters.category.includes(category)}
                  onChange={() => onFilterChange("category", category)}
                />
                <span className="filtersidebar-checkmark"></span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="filtersidebar-section">
        <h4 className="filtersidebar-section-subtitle">Price Range</h4>
        <div className="filtersidebar-price-inputs">
          <input
            type="number"
            className="filtersidebar-price-field"
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
          />
          <span className="filtersidebar-price-separator">-</span>
          <input
            type="number"
            className="filtersidebar-price-field"
            min={filters.price.min}
            value={filters.price.max}
            onChange={(e) =>
              onFilterChange("price", {
                ...filters.price,
                max: Number(e.target.value),
              })
            }
            placeholder="Max"
          />
        </div>
      </div>

      {/* Discount Filter */}
      <div className="filtersidebar-section">
        <label className="filtersidebar-checkbox">
          <input
            type="checkbox"
            className="filtersidebar-checkbox-input"
            checked={filters.discount}
            onChange={() => onFilterChange("discount", !filters.discount)}
          />
          <span className="filtersidebar-checkmark"></span>
          Discounted Items Only
        </label>
      </div>

      {/* Rating Filter */}
      <div className="filtersidebar-section">
        <h4 className="filtersidebar-section-subtitle">Rating</h4>
        <div className="filtersidebar-rating-filter">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`filtersidebar-star-rating ${
                filters.rating === star ? "active" : ""
              }`}
              onClick={() =>
                onFilterChange("rating", filters.rating === star ? 0 : star)
              }
            >
              {star}★ <span className="filtersidebar-rating-up-text">& Up</span>{" "}
              {filters.rating === star && "✓"}
            </div>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="filtersidebar-section">
          <h4 className="filtersidebar-section-subtitle">Tags</h4>
          <div className="filtersidebar-options">
            {availableTags.map((tag) => (
              <label key={tag} className="filtersidebar-checkbox">
                <input
                  type="checkbox"
                  className="filtersidebar-checkbox-input"
                  checked={filters.tags.includes(tag)}
                  onChange={() => onFilterChange("tag", tag)}
                />
                <span className="filtersidebar-checkmark"></span>
                {tag}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Types Filter */}
      {availableTypes.length > 0 && (
        <div className="filtersidebar-section">
          <h4 className="filtersidebar-section-subtitle">Product Types</h4>
          <div className="filtersidebar-options">
            {availableTypes.map((type) => (
              <label key={type} className="filtersidebar-checkbox">
                <input
                  type="checkbox"
                  className="filtersidebar-checkbox-input"
                  checked={filters.types.includes(type)}
                  onChange={() => onFilterChange("type", type)}
                />
                <span className="filtersidebar-checkmark"></span>
                {type}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Optimized comparison function for memoization
 * Only re-renders if the relevant props have actually changed
 */
const areEqual = (prevProps, nextProps) => {
  // Check if filters have changed
  const filtersEqual =
    prevProps.filters.discount === nextProps.filters.discount &&
    prevProps.filters.rating === nextProps.filters.rating &&
    prevProps.filters.price.min === nextProps.filters.price.min &&
    prevProps.filters.price.max === nextProps.filters.price.max &&
    JSON.stringify(prevProps.filters.tags) ===
      JSON.stringify(nextProps.filters.tags) &&
    JSON.stringify(prevProps.filters.types) ===
      JSON.stringify(nextProps.filters.types) &&
    JSON.stringify(prevProps.filters.category) ===
      JSON.stringify(nextProps.filters.category);

  // Check if other props have changed
  const tagsEqual =
    prevProps.availableTags.length === nextProps.availableTags.length;
  const typesEqual =
    prevProps.availableTypes.length === nextProps.availableTypes.length;
  const showCategoryEqual =
    prevProps.showCategoryFilter === nextProps.showCategoryFilter;

  // Return true if props are equal (don't re-render), false if they're different (do re-render)
  return filtersEqual && tagsEqual && typesEqual && showCategoryEqual;
};

// Export memoized component
export default memo(FilterSidebar, areEqual);

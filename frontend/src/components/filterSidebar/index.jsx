import React, { memo } from "react";

// Internal Components
import {
  FilterHeader,
  CategoryFilter,
  PriceFilter,
  DiscountFilter,
  RatingFilter,
  TagsFilter,
  TypesFilter,
} from "./components";

// Internal Hooks
import { useFilterHandlers } from "./hooks";

// Internal Utils
import { areEqual } from "./utils";

// Styles
import "./styles/index.css";

/**
 * FilterSidebar component displays filtering options for products
 * Optimized to prevent unnecessary re-renders
 * @param {object} props - Component props
 * @param {object} props.filters - Current filter values
 * @param {array} props.availableTags - List of available tags
 * @param {array} props.availableTypes - List of available product types
 * @param {function} props.handleFilterChange - Function to handle filter changes
 * @param {function} props.clearAllFilters - Function to clear all filters
 * @param {boolean} props.showCategoryFilter - Controls category filter visibility
 * @returns {JSX.Element} FilterSidebar component
 */
const FilterSidebar = ({
  filters,
  availableTags = [],
  availableTypes = [],
  handleFilterChange,
  clearAllFilters,
  showCategoryFilter = true,
}) => {
  // Custom hooks
  const { onFilterChange, onClearAllFilters } = useFilterHandlers(
    handleFilterChange,
    clearAllFilters
  );

  return (
    <div className="filter-sidebar">
      <FilterHeader onClearAllFilters={onClearAllFilters} />

      {/* Category Filter - Only show if showCategoryFilter is true */}
      {showCategoryFilter && (
        <CategoryFilter filters={filters} onFilterChange={onFilterChange} />
      )}

      {/* Price Range Filter */}
      <PriceFilter filters={filters} onFilterChange={onFilterChange} />

      {/* Discount Filter */}
      <DiscountFilter filters={filters} onFilterChange={onFilterChange} />

      {/* Rating Filter */}
      <RatingFilter filters={filters} onFilterChange={onFilterChange} />

      {/* Tags Filter */}
      <TagsFilter
        availableTags={availableTags}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* Types Filter */}
      <TypesFilter
        availableTypes={availableTypes}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

// Export memoized component
export default memo(FilterSidebar, areEqual);

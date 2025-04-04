import { useCallback } from "react";

/**
 * Custom hook for handling filter changes and clearing all filters
 * @param {function} handleFilterChange - Function to handle filter changes
 * @param {function} clearAllFilters - Function to clear all filters
 * @returns {Object} - Object containing handler functions
 */
const useFilterHandlers = (handleFilterChange, clearAllFilters) => {
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

  return {
    onFilterChange,
    onClearAllFilters,
  };
};

export default useFilterHandlers;

/**
 * Optimized comparison function for memoization
 * Only re-renders if the relevant props have actually changed
 * @param {Object} prevProps - Previous props
 * @param {Object} nextProps - Next props
 * @returns {boolean} - True if props are equal (don't re-render), false if different
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

export default areEqual;

const FilterSidebar = ({
  filters,
  availableTags,
  availableTypes,
  handleFilterChange,
  clearAllFilters,
}) => {
  return (
    <div className="filter-sidebar">
      <div className="filter-section">
        <h3>Filters</h3>
        <button className="clear-filters" onClick={clearAllFilters}>
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-options">
          {["men", "women", "kids"].map((category) => (
            <label key={category} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={() => handleFilterChange("category", category)}
              />
              <span className="checkmark"></span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            min="0"
            max={filters.price.max}
            value={filters.price.min}
            onChange={(e) =>
              handleFilterChange("price", {
                ...filters.price,
                min: Number(e.target.value),
              })
            }
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            min={filters.price.min}
            value={filters.price.max}
            onChange={(e) =>
              handleFilterChange("price", {
                ...filters.price,
                max: Number(e.target.value),
              })
            }
            placeholder="Max"
          />
        </div>
      </div>

      {/* Discount Filter */}
      <div className="filter-section">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.discount}
            onChange={() => handleFilterChange("discount", !filters.discount)}
          />
          <span className="checkmark"></span>
          Discounted Items Only
        </label>
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <h4>Rating</h4>
        <div className="rating-filter">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`star-rating ${
                filters.rating === star ? "active" : ""
              }`}
              onClick={() =>
                handleFilterChange("rating", filters.rating === star ? 0 : star)
              }
            >
              {star}★ & Up {filters.rating === star && "✓"}
            </div>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="filter-section">
          <h4>Tags</h4>
          <div className="filter-options">
            {availableTags.map((tag) => (
              <label key={tag} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => handleFilterChange("tag", tag)}
                />
                <span className="checkmark"></span>
                {tag}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Types Filter */}
      {availableTypes.length > 0 && (
        <div className="filter-section">
          <h4>Product Types</h4>
          <div className="filter-options">
            {availableTypes.map((type) => (
              <label key={type} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleFilterChange("type", type)}
                />
                <span className="checkmark"></span>
                {type}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;

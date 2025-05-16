import { memo } from "react";
import PropTypes from "prop-types";
import Item from "../../../components/item/Item";
import dropdown_icon from "../../../components/assets/dropdown_icon.png";

/**
 * ProductsContent component that displays the product grid and filter controls
 * Uses flex layout with wrap for responsive design
 */
const ProductsContent = ({
  displayedProducts,
  totalProducts,
  displayRange,
  showSortOptions,
  setShowSortOptions,
  sortBy,
  handleSortChange,
  itemsPerPage,
  handleItemsPerPageChange,
  currentPage,
  totalPages,
  handlePageChange,
  clearAllFilters,
}) => {
  // Get current sort label based on sortBy value
  const getSortLabel = () => {
    switch (sortBy) {
      case "price-asc":
        return "Price: Low to High";
      case "price-desc":
        return "Price: High to Low";
      case "date-newest":
        return "Date: Newest First";
      case "date-oldest":
        return "Date: Oldest First";
      case "discount":
        return "Biggest Discount";
      case "rating":
        return "Highest Rating";
      default:
        return "Sort By";
    }
  };

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages when total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show subset of pages with ellipsis
      if (currentPage <= 3) {
        // Near start: show 1, 2, 3, ..., totalPages
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end: show 1, ..., totalPages-2, totalPages-1, totalPages
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle: show 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Handle keydown event for sort dropdown for accessibility
  const handleSortKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowSortOptions(!showSortOptions);
    }
  };

  // Handler for selecting a sort option with keyboard
  const handleSortOptionKeyDown = (e, sortOption) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSortChange(sortOption);
    }
  };

  return (
    <div className="product-listing-products-content">
      {/* Filter/sort bar */}
      <div className="product-listing-filter-bar">
        <div className="product-listing-filter-text">
          Showing{" "}
          <span className="product-listing-filter-highlight">
            {displayRange}
          </span>{" "}
          of{" "}
          <span className="product-listing-filter-highlight">
            {totalProducts}
          </span>{" "}
          products
        </div>

        <div className="product-listing-controls">
          {/* Items per page selector */}
          <div className="product-listing-items-per-page">
            <label
              htmlFor="items-per-page"
              className="product-listing-select-label"
            >
              Show:
            </label>
            <select
              id="items-per-page"
              className="product-listing-select"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              aria-label="Items per page"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="product-listing-sort">
            <div
              className="product-listing-sort-dropdown"
              onClick={() => setShowSortOptions(!showSortOptions)}
              onKeyDown={handleSortKeyDown}
              tabIndex="0"
              role="button"
              aria-haspopup="listbox"
              aria-expanded={showSortOptions}
              aria-label="Sort products"
            >
              {getSortLabel()}
              <img
                src={dropdown_icon}
                alt=""
                className="product-listing-sort-icon"
              />
            </div>

            {showSortOptions && (
              <div className="product-listing-sort-options" role="listbox">
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("price-asc")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "price-asc")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "price-asc"}
                >
                  Price: Low to High
                </div>
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("price-desc")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "price-desc")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "price-desc"}
                >
                  Price: High to Low
                </div>
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("date-newest")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "date-newest")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "date-newest"}
                >
                  Date: Newest First
                </div>
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("date-oldest")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "date-oldest")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "date-oldest"}
                >
                  Date: Oldest First
                </div>
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("discount")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "discount")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "discount"}
                >
                  Biggest Discount
                </div>
                <div
                  className="product-listing-sort-option"
                  onClick={() => handleSortChange("rating")}
                  onKeyDown={(e) => handleSortOptionKeyDown(e, "rating")}
                  tabIndex="0"
                  role="option"
                  aria-selected={sortBy === "rating"}
                >
                  Highest Rating
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product grid - using flexbox with wrap */}
      {displayedProducts && displayedProducts.length > 0 ? (
        <div className="product-listing-grid">
          {displayedProducts.map((product) => (
            <div
              key={product._id || product.id || Math.random()}
              className="product-listing-item"
            >
              <Item {...product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="product-listing-no-products">
          <p className="product-listing-no-products-text">
            {totalProducts > 0
              ? "No products match your current filters."
              : "No products available in this category."}
          </p>
          {totalProducts > 0 && (
            <button
              className="product-listing-no-products-button"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="product-listing-pagination">
          <button
            className={`product-listing-page-btn ${
              currentPage === 1 ? "product-listing-disabled" : ""
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Prev
          </button>

          <div className="product-listing-page-numbers">
            {generatePaginationNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="product-listing-ellipsis"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`product-listing-page-number ${
                    currentPage === page ? "product-listing-active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className={`product-listing-page-btn ${
              currentPage === totalPages ? "product-listing-disabled" : ""
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

ProductsContent.propTypes = {
  displayedProducts: PropTypes.array.isRequired,
  totalProducts: PropTypes.number.isRequired,
  displayRange: PropTypes.string.isRequired,
  showSortOptions: PropTypes.bool.isRequired,
  setShowSortOptions: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  handleSortChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  clearAllFilters: PropTypes.func.isRequired,
};

export default memo(ProductsContent);

import Item from "../../../components/item/Item";
import dropdown_icon from "../../../components/assets/dropdown_icon.png";

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
  return (
    <div className="products-content">
      <div className="offers-filter-bar">
        <p className="category-filter-text">
          <span className="category-filter-highlight">
            Showing {displayRange}{" "}
          </span>
          of {totalProducts} products
        </p>

        <div className="controls-container">
          {/* Items per page selector */}
          <div className="items-per-page">
            Show:
            <select
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div
            className="sort-dropdown"
            onClick={() => setShowSortOptions(!showSortOptions)}
          >
            Sort by:{" "}
            {sortBy === "newest"
              ? "Newest"
              : sortBy === "price-asc"
              ? "Price: Low to High"
              : sortBy === "price-desc"
              ? "Price: High to Low"
              : sortBy === "discount"
              ? "Biggest Discount"
              : sortBy === "rating"
              ? "Highest Rating"
              : "Newest"}
            <img src={dropdown_icon} alt="" />
            {showSortOptions && (
              <div className="sort-options">
                <div
                  className="sort-option-item"
                  onClick={() => handleSortChange("newest")}
                >
                  Newest
                </div>
                <div
                  className="sort-option-item"
                  onClick={() => handleSortChange("price-asc")}
                >
                  Price: Low to High
                </div>
                <div
                  className="sort-option-item"
                  onClick={() => handleSortChange("price-desc")}
                >
                  Price: High to Low
                </div>
                <div
                  className="sort-option-item"
                  onClick={() => handleSortChange("discount")}
                >
                  Biggest Discount
                </div>
                <div
                  className="sort-option-item"
                  onClick={() => handleSortChange("rating")}
                >
                  Highest Rating
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((item, index) => (
            <Item
              key={item._id || item.id || index}
              id={item.id}
              _id={item._id}
              slug={item.slug}
              name={item.name}
              images={item.images}
              mainImageIndex={item.mainImageIndex}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <div className="no-products">
            <p className="no-products-text">No products match your filters.</p>
            <button className="error-button" onClick={clearAllFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;

              if (totalPages > 7) {
                if (pageNumber === 1 || pageNumber === totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      className={`page-number ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                if (
                  pageNumber === currentPage ||
                  pageNumber === currentPage - 1 ||
                  pageNumber === currentPage + 1
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`page-number ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={pageNumber} className="ellipsis">
                      ...
                    </span>
                  );
                }

                return null;
              }

              return (
                <button
                  key={pageNumber}
                  className={`page-number ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            className={`page-btn ${
              currentPage === totalPages ? "disabled" : ""
            }`}
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsContent;

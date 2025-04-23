import React from "react";
import PropTypes from "prop-types";

/**
 * Pagination component for OrderHistoryPage
 * Based on ProductsContent pagination
 */
const OrderPagination = ({ currentPage, totalPages, handlePageChange }) => {
  // Generate pagination numbers with ellipsis for large number of pages
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

  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="order-pagination">
      <div className="order-pagination-controls">
        {/* Pagination buttons - now centered */}
        <div className="order-page-navigation">
          <button
            className={`order-page-btn ${
              currentPage === 1 ? "order-disabled" : ""
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Prev
          </button>

          <div className="order-page-numbers">
            {generatePaginationNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="order-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`order-page-number ${
                    currentPage === page ? "order-active" : ""
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
            className={`order-page-btn ${
              currentPage === totalPages ? "order-disabled" : ""
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

OrderPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
};

export default OrderPagination;

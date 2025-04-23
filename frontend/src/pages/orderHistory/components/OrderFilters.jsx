import React, { useState } from "react";
import PropTypes from "prop-types";
import dropdown_icon from "../../../components/assets/dropdown_icon.png";

/**
 * Component to handle filtering and sorting of orders
 */
const OrderFilters = ({
  statusFilter,
  handleStatusFilterChange,
  dateRangeFilter,
  handleDateRangeFilterChange,
  sortBy,
  handleSortChange,
  clearAllFilters,
  filteredOrdersCount,
  totalOrdersCount,
  currentPage,
  itemsPerPage,
  handleItemsPerPageChange,
}) => {
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Get sort label based on current sort option
  const getSortLabel = () => {
    switch (sortBy) {
      case "newest":
        return "Newest First";
      case "oldest":
        return "Oldest First";
      case "price-high":
        return "Price: High to Low";
      case "price-low":
        return "Price: Low to High";
      default:
        return "Sort By";
    }
  };

  // Calculate display range for pagination info
  const calculateDisplayRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredOrdersCount);

    if (filteredOrdersCount === 0) {
      return "0-0";
    }

    return `${start}-${end}`;
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
      setShowSortOptions(false);
    }
  };

  // Handler for clearing date inputs
  const handleClearDates = () => {
    handleDateRangeFilterChange(null, null);
  };

  return (
    <div className="order-history-filter-bar">
      <div className="order-history-filter-info">
        <div className="order-history-filter-text">
          Showing{" "}
          <span className="order-history-filter-highlight">
            {calculateDisplayRange()}
          </span>{" "}
          of{" "}
          <span className="order-history-filter-highlight">
            {filteredOrdersCount}
          </span>{" "}
          orders
        </div>

        <div className="order-history-items-per-page">
          <label
            htmlFor="order-items-per-page"
            className="order-history-select-label"
          >
            Show:
          </label>
          <select
            id="order-items-per-page"
            className="order-history-select"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            aria-label="Orders per page"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <button
          className="order-history-filter-clear-btn"
          onClick={clearAllFilters}
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>

      <div className="order-history-filter-controls">
        {/* Status filter */}
        <div className="order-history-filter-group">
          <label htmlFor="status-filter" className="order-history-filter-label">
            Status:
          </label>
          <select
            id="status-filter"
            className="order-history-filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            aria-label="Filter orders by status"
          >
            <option value="all">All</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date range filter */}
        <div className="order-history-filter-group order-history-filter-date-group">
          <label className="order-history-filter-label">Date Range:</label>
          <div className="order-history-filter-date-inputs">
            <input
              type="date"
              className="order-history-filter-date"
              value={dateRangeFilter.startDate || ""}
              onChange={(e) =>
                handleDateRangeFilterChange(
                  e.target.value,
                  dateRangeFilter.endDate
                )
              }
              aria-label="Filter orders from date"
              placeholder="From"
            />
            <span className="order-history-filter-date-separator">to</span>
            <input
              type="date"
              className="order-history-filter-date"
              value={dateRangeFilter.endDate || ""}
              onChange={(e) =>
                handleDateRangeFilterChange(
                  dateRangeFilter.startDate,
                  e.target.value
                )
              }
              aria-label="Filter orders to date"
              placeholder="To"
            />
            <button
              className="order-history-filter-date-clear"
              onClick={handleClearDates}
              aria-label="Clear date filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Sort dropdown */}
        <div className="order-history-filter-sort">
          <div
            className="order-history-filter-sort-dropdown"
            onClick={() => setShowSortOptions(!showSortOptions)}
            onKeyDown={handleSortKeyDown}
            tabIndex="0"
            role="button"
            aria-haspopup="listbox"
            aria-expanded={showSortOptions}
            aria-label="Sort orders"
            data-testid="sort-dropdown"
          >
            <span className="order-history-filter-sort-label">
              {getSortLabel()}
            </span>
            <img
              src={dropdown_icon}
              alt=""
              className="order-history-filter-sort-icon"
            />
          </div>

          {showSortOptions && (
            <div className="order-history-filter-sort-options" role="listbox">
              <div
                className="order-history-filter-sort-option"
                onClick={() => {
                  handleSortChange("newest");
                  setShowSortOptions(false);
                }}
                onKeyDown={(e) => handleSortOptionKeyDown(e, "newest")}
                tabIndex="0"
                role="option"
                aria-selected={sortBy === "newest"}
              >
                Newest First
              </div>
              <div
                className="order-history-filter-sort-option"
                onClick={() => {
                  handleSortChange("oldest");
                  setShowSortOptions(false);
                }}
                onKeyDown={(e) => handleSortOptionKeyDown(e, "oldest")}
                tabIndex="0"
                role="option"
                aria-selected={sortBy === "oldest"}
              >
                Oldest First
              </div>
              <div
                className="order-history-filter-sort-option"
                onClick={() => {
                  handleSortChange("price-high");
                  setShowSortOptions(false);
                }}
                onKeyDown={(e) => handleSortOptionKeyDown(e, "price-high")}
                tabIndex="0"
                role="option"
                aria-selected={sortBy === "price-high"}
              >
                Price: High to Low
              </div>
              <div
                className="order-history-filter-sort-option"
                onClick={() => {
                  handleSortChange("price-low");
                  setShowSortOptions(false);
                }}
                onKeyDown={(e) => handleSortOptionKeyDown(e, "price-low")}
                tabIndex="0"
                role="option"
                aria-selected={sortBy === "price-low"}
              >
                Price: Low to High
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrderFilters.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  handleStatusFilterChange: PropTypes.func.isRequired,
  dateRangeFilter: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  handleDateRangeFilterChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  handleSortChange: PropTypes.func.isRequired,
  clearAllFilters: PropTypes.func.isRequired,
  filteredOrdersCount: PropTypes.number.isRequired,
  totalOrdersCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired,
};

export default OrderFilters;

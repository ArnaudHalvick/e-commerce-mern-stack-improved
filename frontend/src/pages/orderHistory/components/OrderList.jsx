import React from "react";
import PropTypes from "prop-types";
import OrderCard from "./OrderCard";
import NoOrders from "./NoOrders";
import OrderFilters from "./OrderFilters";
import OrderPagination from "./OrderPagination";

/**
 * Enhanced component to display a list of orders with filtering and pagination
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects to display (paginated)
 * @param {Number} props.filteredOrdersCount - Total count of filtered orders
 * @param {Number} props.totalOrdersCount - Total count of all orders
 * @param {String} props.statusFilter - Current status filter
 * @param {Function} props.handleStatusFilterChange - Handler for status filter change
 * @param {Object} props.dateRangeFilter - Date range filter object
 * @param {Function} props.handleDateRangeFilterChange - Handler for date filter change
 * @param {String} props.sortBy - Current sort option
 * @param {Function} props.handleSortChange - Handler for sort change
 * @param {Function} props.clearAllFilters - Function to clear all filters
 * @param {Number} props.currentPage - Current page number
 * @param {Number} props.totalPages - Total number of pages
 * @param {Function} props.handlePageChange - Handler for page change
 * @param {Number} props.itemsPerPage - Items per page
 * @param {Function} props.handleItemsPerPageChange - Handler for items per page change
 */
const OrderList = ({
  orders,
  filteredOrdersCount,
  totalOrdersCount,
  statusFilter,
  handleStatusFilterChange,
  dateRangeFilter,
  handleDateRangeFilterChange,
  sortBy,
  handleSortChange,
  clearAllFilters,
  currentPage,
  totalPages,
  handlePageChange,
  itemsPerPage,
  handleItemsPerPageChange,
}) => {
  // If there are no orders at all, show the NoOrders component
  if (totalOrdersCount === 0) {
    return <NoOrders />;
  }

  return (
    <div className="order-history-container">
      {/* Filters and sorting */}
      <OrderFilters
        statusFilter={statusFilter}
        handleStatusFilterChange={handleStatusFilterChange}
        dateRangeFilter={dateRangeFilter}
        handleDateRangeFilterChange={handleDateRangeFilterChange}
        sortBy={sortBy}
        handleSortChange={handleSortChange}
        clearAllFilters={clearAllFilters}
        filteredOrdersCount={filteredOrdersCount}
        totalOrdersCount={totalOrdersCount}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Show orders or empty state message */}
      {filteredOrdersCount === 0 ? (
        <div className="order-history-no-results">
          <div className="order-history-no-results-text">
            No orders match your current filters.
          </div>
          <button
            className="order-history-clear-filters-btn"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

OrderList.propTypes = {
  orders: PropTypes.array.isRequired,
  filteredOrdersCount: PropTypes.number.isRequired,
  totalOrdersCount: PropTypes.number.isRequired,
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
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired,
};

export default OrderList;

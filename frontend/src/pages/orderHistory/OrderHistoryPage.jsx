import React from "react";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";
import { useOrderHistory } from "./hooks";
import { OrderList, LoadingState, ErrorState } from "./components";
import "./styles/index.css";

/**
 * Order History Page Component
 * Shows the user's past orders and their status with filtering, sorting, and pagination
 */
const OrderHistoryPage = () => {
  const {
    orders,
    allOrders,
    filteredOrdersCount,
    loading,
    error,
    refreshOrders,

    // Sorting
    sortBy,
    handleSortChange,

    // Filters
    statusFilter,
    dateRangeFilter,
    handleStatusFilterChange,
    handleDateRangeFilterChange,
    clearAllFilters,

    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = useOrderHistory();

  return (
    <>
      <Breadcrumb
        routes={[{ label: "Home", path: "/" }, { label: "Order History" }]}
      />
      <div>
        <div className="order-history-page-title">Order History</div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState errorMessage={error} retryHandler={refreshOrders} />
        ) : (
          <OrderList
            orders={orders}
            filteredOrdersCount={filteredOrdersCount}
            totalOrdersCount={allOrders.length}
            // Sorting
            sortBy={sortBy}
            handleSortChange={handleSortChange}
            // Filters
            statusFilter={statusFilter}
            dateRangeFilter={dateRangeFilter}
            handleStatusFilterChange={handleStatusFilterChange}
            handleDateRangeFilterChange={handleDateRangeFilterChange}
            clearAllFilters={clearAllFilters}
            // Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;

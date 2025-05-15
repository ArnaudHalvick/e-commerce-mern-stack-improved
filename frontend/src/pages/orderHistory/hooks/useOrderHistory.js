import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { paymentsService } from "../../../api";
import { showError } from "../../../redux/slices/errorSlice";

/**
 * Hook to fetch and manage order history data with filtering, sorting and pagination
 * @returns {Object} Order history state and helper functions
 */
const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: null,
    endDate: null,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentsService.getMyOrders();
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch orders";
      setError(errorMessage);
      dispatch(showError(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters and sorting to orders
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (order) =>
          order &&
          order.orderStatus &&
          order.orderStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date range filter
    if (dateRangeFilter.startDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      result = result.filter(
        (order) =>
          order && order.createdAt && new Date(order.createdAt) >= startDate
      );
    }

    if (dateRangeFilter.endDate) {
      const endDate = new Date(dateRangeFilter.endDate);
      result = result.filter(
        (order) =>
          order && order.createdAt && new Date(order.createdAt) <= endDate
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        case "oldest":
          return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
        case "price-high":
          return (b?.totalAmount || 0) - (a?.totalAmount || 0);
        case "price-low":
          return (a?.totalAmount || 0) - (b?.totalAmount || 0);
        case "alpha-asc":
          return (a?._id || "").localeCompare(b?._id || "");
        case "alpha-desc":
          return (b?._id || "").localeCompare(a?._id || "");
        default:
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }
    });

    setFilteredOrders(result);

    // Calculate total pages for pagination
    setTotalPages(Math.max(1, Math.ceil(result.length / itemsPerPage)));

    // Reset to first page if filters change and current page is out of bounds
    if (currentPage > Math.ceil(result.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [
    orders,
    statusFilter,
    dateRangeFilter,
    sortBy,
    itemsPerPage,
    currentPage,
  ]);

  // Get current orders for pagination
  const getCurrentOrders = useCallback(() => {
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle date range filter change
  const handleDateRangeFilterChange = (startDate, endDate) => {
    setDateRangeFilter({ startDate, endDate });
    setCurrentPage(1); // Reset to first page
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("all");
    setDateRangeFilter({ startDate: null, endDate: null });
    setSortBy("newest");
    setCurrentPage(1);
  };

  return {
    allOrders: orders,
    orders: getCurrentOrders(),
    filteredOrdersCount: filteredOrders.length,
    loading,
    error,
    refreshOrders: fetchOrders,

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
  };
};

export default useOrderHistory;

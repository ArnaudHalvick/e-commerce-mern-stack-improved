import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { paymentsService } from "../../../api";
import { showError } from "../../../redux/slices/errorSlice";

/**
 * Hook to fetch and manage order history data
 * @returns {Object} Order history state and helper functions
 */
const useOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
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
    };

    fetchOrders();
  }, [dispatch]);

  // Refresh orders function
  const refreshOrders = async () => {
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
  };

  return {
    orders,
    loading,
    error,
    refreshOrders,
  };
};

export default useOrderHistory;

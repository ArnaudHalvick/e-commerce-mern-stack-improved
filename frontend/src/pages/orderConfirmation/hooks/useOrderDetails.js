import { useState, useEffect } from "react";
import { paymentsService } from "../../../api";

/**
 * Custom hook to fetch and manage order details
 * @param {string} orderId - The ID of the order to fetch
 * @param {Object} initialOrderDetails - Optional initial order details (from navigation state)
 * @returns {Object} Order details state including loading, error, and order data
 */
const useOrderDetails = (orderId, initialOrderDetails = null) => {
  const [order, setOrder] = useState(initialOrderDetails);
  const [loading, setLoading] = useState(!initialOrderDetails);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have order details passed initially, use those
    if (initialOrderDetails) {
      setOrder(initialOrderDetails);
      setLoading(false);
      return;
    }

    // Otherwise fetch the order
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await paymentsService.getOrderDetails(orderId);
        setOrder(data.order);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, initialOrderDetails]);

  return { order, loading, error };
};

export default useOrderDetails;

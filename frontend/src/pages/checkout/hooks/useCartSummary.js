import { useState, useEffect } from "react";
import { paymentsService } from "../../../api";

const useCartSummary = () => {
  const [cartSummary, setCartSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await paymentsService.getCartSummary();
        setCartSummary({
          amount: data.amount,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingAmount: data.shippingAmount,
        });
      } catch (err) {
        console.error("Failed to fetch cart summary:", err);
        setError("Failed to load cart summary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return {
    cartSummary,
    isLoading,
    error,
  };
};

export default useCartSummary;

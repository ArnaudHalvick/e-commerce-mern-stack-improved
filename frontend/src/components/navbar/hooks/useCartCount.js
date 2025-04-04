import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../../../redux/slices/cartSlice";
import { useAuth } from "../../../hooks/state";

/**
 * Custom hook for managing cart count
 * @returns {Object} Cart count state
 */
const useCartCount = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { totalItems = 0 } = useSelector(
    (state) => state.cart || { totalItems: 0 }
  );

  // Fetch cart items when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  return {
    totalItems: isAuthenticated ? totalItems : 0,
    isAuthenticated,
  };
};

export default useCartCount;

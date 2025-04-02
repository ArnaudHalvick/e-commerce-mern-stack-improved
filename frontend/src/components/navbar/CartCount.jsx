import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../../redux/slices/cartSlice";
import { useAuth } from "../../hooks/state";

const CartCount = () => {
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

  // Only show cart count if user is authenticated
  return (
    <div
      className="nav-cart-count"
      aria-label={`${totalItems} items in cart`}
      role="status"
    >
      {isAuthenticated ? totalItems : 0}
    </div>
  );
};

export default CartCount;

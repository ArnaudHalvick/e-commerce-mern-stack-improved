import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../../redux/slices/cartSlice";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const CartCount = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);
  const { totalItems = 0 } = useSelector(
    (state) => state.cart || { totalItems: 0 }
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return <div className="nav-cart-count">{totalItems}</div>;
};

export default CartCount;

import "./Item.css";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ItemRedux = (props) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      dispatch(addToCart({ itemId: props.id, quantity: 1 }));
    } else {
      // Redirect to login or show a message
      alert("Please login to add items to cart");
    }
  };

  return (
    <div className="item-container">
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt="" />
      </Link>
      <p>{props.name}</p>
      <div className="item-price-container">
        <div className="item-price-current">${props.new_price}</div>
        <div className="item-price-previous">${props.old_price}</div>
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default ItemRedux;

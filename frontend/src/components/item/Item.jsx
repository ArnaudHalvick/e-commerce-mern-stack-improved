// Path: frontend/src/components/item/Item.jsx
import "./Item.css";
import { Link } from "react-router-dom";

const Item = (props) => {
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
    </div>
  );
};

export default Item;

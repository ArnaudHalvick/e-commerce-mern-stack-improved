import React, { useMemo } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { config } from "../../api";

const Item = (props) => {
  // Get image URL safely
  const imageUrl = useMemo(() => {
    return config.getImageUrl(props.image);
  }, [props.image]);

  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <img src={imageUrl} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">${props.new_price}</div>
        {props.old_price && (
          <div className="item-price-old">${props.old_price}</div>
        )}
      </div>
    </div>
  );
};

export default Item;

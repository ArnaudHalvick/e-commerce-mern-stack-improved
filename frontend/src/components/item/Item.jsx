import React, { useMemo } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { config } from "../../api";

const Item = (props) => {
  // Get image URL safely
  const imageUrl = useMemo(() => {
    // Try to get the main image first, then fall back to first image in array, then to a provided image prop
    if (props.mainImage) {
      return config.getImageUrl(props.mainImage);
    } else if (props.images && props.images.length > 0) {
      const mainIndex = props.mainImageIndex || 0;
      return config.getImageUrl(props.images[mainIndex]);
    } else if (props.image) {
      return config.getImageUrl(props.image);
    }
    return ""; // Fallback to empty string if no image is available
  }, [props.mainImage, props.images, props.mainImageIndex, props.image]);

  // Determine the product URL - prefer slug if available
  const productUrl = useMemo(() => {
    if (props.slug) {
      return `/products/${props.slug}`;
    } else if (props._id) {
      return `/product/${props._id}`;
    } else if (props.id) {
      return `/product/${props.id}`;
    }
    return "#"; // Fallback if no ID is available
  }, [props.slug, props._id, props.id]);

  return (
    <div className="item">
      <Link to={productUrl} data-discover="true">
        <img src={imageUrl} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">${props.new_price || 0}</div>
        {props.old_price > 0 && (
          <div className="item-price-old">${props.old_price}</div>
        )}
      </div>
    </div>
  );
};

export default Item;

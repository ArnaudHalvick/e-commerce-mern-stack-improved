// Path: frontend/src/components/item/Item.jsx
import "./Item.css";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const Item = (props) => {
  // Extract the base URL from any product image or use the default API URL
  const getBaseUrl = useMemo(() => {
    if (props.images && props.images.length > 0) {
      const sampleUrl = props.images[0];
      // Extract the base URL (e.g., http://localhost:4000)
      const urlParts = sampleUrl.split("/");
      if (urlParts.length >= 3) {
        return `${urlParts[0]}//${urlParts[2]}`;
      }
    }
    // Default to the API server URL if no images or URL parsing fails
    return "http://localhost:4000";
  }, [props.images]);

  // Get the main image from images array, or use the first image if available, or fall back to a placeholder
  const mainImage =
    props.images && props.images.length > 0
      ? props.images[props.mainImageIndex || 0]
      : `${getBaseUrl}/images/pink-placeholder.png`;

  return (
    <div className="item-container">
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={mainImage} alt="" />
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

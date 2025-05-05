import React, { useMemo } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { config } from "../../api";

const Item = (props) => {
  const imageUrl = useMemo(() => {
    if (props.mainImage) {
      return config.getImageUrl(props.mainImage);
    } else if (props.images && props.images.length > 0) {
      const mainIndex = props.mainImageIndex || 0;
      return config.getImageUrl(props.images[mainIndex]);
    } else if (props.image) {
      return config.getImageUrl(props.image);
    }
    return "";
  }, [props.mainImage, props.images, props.mainImageIndex, props.image]);

  const productUrl = useMemo(() => {
    if (props.slug) {
      return `/products/${props.slug}`;
    } else if (props._id) {
      return `/product/${props._id}`;
    } else if (props.id) {
      return `/product/${props.id}`;
    }
    return "#";
  }, [props.slug, props._id, props.id]);

  const hasNewPrice = props.new_price > 0;
  const hasDiscount = hasNewPrice && props.old_price > props.new_price;
  const discountPercentage = hasDiscount
    ? Math.round(((props.old_price - props.new_price) / props.old_price) * 100)
    : 0;

  return (
    <div className="product-item">
      <Link to={productUrl} data-discover="true" className="product-image-link">
        <img className="product-item-image" src={imageUrl} alt={props.name} />
        {hasDiscount && (
          <div className="product-item-discount-tag">
            -{discountPercentage}%
          </div>
        )}
      </Link>
      <p className="product-item-name">{props.name}</p>
      <div className="product-item-prices">
        {hasNewPrice ? (
          <>
            <div className="product-item-price-discounted">
              ${props.new_price}
            </div>
            {props.old_price > 0 && (
              <div className="product-item-price-previous">
                ${props.old_price}
              </div>
            )}
          </>
        ) : (
          props.old_price > 0 && (
            <div className="product-item-price-current">${props.old_price}</div>
          )
        )}
      </div>
    </div>
  );
};

export default Item;

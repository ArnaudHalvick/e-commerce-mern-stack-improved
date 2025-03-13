import "./Item.css";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const Item = (props) => {
  const { images, new_price, old_price, slug, _id, id, name, mainImageIndex } =
    props;

  // Extract the base URL from any product image or use the default API URL
  const getBaseUrl = useMemo(() => {
    if (images && images.length > 0) {
      const sampleUrl = images[0];
      const urlParts = sampleUrl.split("/");
      if (urlParts.length >= 3) {
        return `${urlParts[0]}//${urlParts[2]}`;
      }
    }
    return "http://localhost:4000";
  }, [images]);

  // Get the main image from images array, or use the first image if available, or fall back to a placeholder
  const mainImage =
    images && images.length > 0
      ? images[mainImageIndex || 0]
      : `${getBaseUrl}/images/pink-placeholder.png`;

  // Check if the item has a discount (new_price > 0)
  const hasDiscount = new_price && new_price > 0;

  // Generate the product link using slug if available, fallback to _id if available, or just use a generic link
  const productLink = useMemo(() => {
    const mongoId = _id && typeof _id === "object" && _id.$oid ? _id.$oid : _id;

    if (slug) {
      return `/products/${slug}`;
    } else if (mongoId) {
      return `/product/${mongoId}`;
    } else if (id) {
      return `/product/${id}`;
    } else {
      console.warn("Product without slug or id:", { images, slug, _id, id });
      return `/`;
    }
  }, [slug, _id, id, images]); // added images here for the console.warn

  return (
    <div className="item-container">
      <Link to={productLink}>
        <img onClick={() => window.scrollTo(0, 0)} src={mainImage} alt="" />
      </Link>
      <p>{name}</p>
      <div className="item-price-container">
        {hasDiscount ? (
          <>
            <div className="item-price-current item-price-discounted">
              ${new_price}
            </div>
            <div className="item-price-previous">${old_price}</div>
          </>
        ) : (
          <div className="item-price-current">${old_price}</div>
        )}
      </div>
    </div>
  );
};

export default Item;

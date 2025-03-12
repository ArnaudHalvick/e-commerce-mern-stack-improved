import "./ProductDisplay.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { useContext, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { AuthContext } from "../../context/AuthContext";

const ProductDisplay = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);
  const [isAdding, setIsAdding] = useState(false);

  // Set up state for the currently selected image index.
  const [selectedImageIndex, setSelectedImageIndex] = useState(
    product.mainImageIndex || 0
  );

  // Utility to get the base URL from any product image.
  const getBaseUrl = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const sampleUrl = product.images[0];
      const urlParts = sampleUrl.split("/");
      if (urlParts.length >= 3) {
        return `${urlParts[0]}//${urlParts[2]}`;
      }
    }
    return "http://localhost:4000";
  }, [product.images]);

  // Determine the main image based on the selected image index.
  const mainImage = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images[selectedImageIndex];
    }
    return `${getBaseUrl}/images/pink-placeholder.png`;
  }, [product.images, selectedImageIndex, getBaseUrl]);

  // Render star rating (same as before).
  const renderStarRating = useMemo(() => {
    const rating = product.rating || 0;
    const stars = [];
    let fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    if (decimalPart >= 0.7) fullStars += 1;
    fullStars = Math.min(fullStars, 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img
          key={i}
          src={i <= fullStars ? star_icon : star_dull_icon}
          alt="star"
        />
      );
    }
    return stars;
  }, [product.rating]);

  // Other memoized values remain unchanged...
  const productTypes = useMemo(
    () => product.types?.join(", ") || "N/A",
    [product.types]
  );
  const productTags = useMemo(
    () => product.tags?.join(", ") || "N/A",
    [product.tags]
  );
  const reviewCount = useMemo(
    () => (product.reviews ? product.reviews.length : 0),
    [product.reviews]
  );

  // Handle Add to Cart (same as before).
  const handleAddToCart = useCallback(() => {
    if (isAdding) return;
    setIsAdding(true);
    if (isAuthenticated) {
      dispatch(addToCart({ itemId: product._id, quantity: 1 }));
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      alert("Please login to add items to cart");
      setIsAdding(false);
    }
  }, [dispatch, product._id, isAuthenticated, isAdding]);

  return (
    <div className="product-display">
      <div className="product-display-left">
        {/* Thumbnail list: render all images */}
        <div className="product-display-img-list">
          {product.images && product.images.length > 0 ? (
            product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => setSelectedImageIndex(index)}
                className={
                  selectedImageIndex === index ? "selected-thumbnail" : ""
                }
              />
            ))
          ) : (
            <img src={`${getBaseUrl}/images/pink-placeholder.png`} alt="" />
          )}
        </div>
        {/* Main image display */}
        <div className="product-display-img">
          <img src={mainImage} alt="" className="product-display-main-img" />
        </div>
      </div>
      <div className="product-display-right">
        <h1>{product.name}</h1>
        <div className="product-display-right-stars">
          {renderStarRating}
          <p>({reviewCount})</p>
        </div>
        <div className="product-display-right-prices">
          <div
            className={
              product.new_price
                ? "product-display-right-price-old"
                : "product-display-right-price-single"
            }
          >
            ${product.old_price}
          </div>
          {product.new_price && (
            <div className="product-display-right-price-new">
              ${product.new_price}
            </div>
          )}
        </div>
        <div className="product-display-right-description">
          <p>{product.shortDescription}</p>
        </div>
        <div className="product-display-right-size">
          <h1>Select Size</h1>
          <div className="product-display-right-size-container">
            {product.sizes &&
              product.sizes.map((size, index) => <div key={index}>{size}</div>)}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={isAdding ? "adding-to-cart" : ""}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
        <p className="product-display-right-category">
          <span>Category: </span>
          {product.types && product.types.length > 0 ? productTypes : ""}
        </p>
        <p className="product-display-right-category">
          <span>Tags: </span>
          {productTags}
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;

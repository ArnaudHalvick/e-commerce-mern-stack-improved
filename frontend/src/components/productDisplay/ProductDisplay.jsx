// Path: frontend/src/components/productDisplay/ProductDisplay.jsx
import "./ProductDisplay.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { useContext, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { AuthContext } from "../../context/AuthContext";

const ProductDisplay = (props) => {
  const { product } = props;
  const dispatch = useDispatch();
  const { isAuthenticated } = useContext(AuthContext);
  const [isAdding, setIsAdding] = useState(false);

  // Extract the base URL from any product image or use the default API URL
  const getBaseUrl = useMemo(() => {
    if (product.images && product.images.length > 0) {
      const sampleUrl = product.images[0];
      // Extract the base URL (e.g., http://localhost:4000)
      const urlParts = sampleUrl.split("/");
      if (urlParts.length >= 3) {
        return `${urlParts[0]}//${urlParts[2]}`;
      }
    }
    // Default to the API server URL if no images or URL parsing fails
    return "http://localhost:4000";
  }, [product.images]);

  // Get the main image from images array with fallback
  const mainImage = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images[product.mainImageIndex || 0];
    }
    return `${getBaseUrl}/images/pink-placeholder.png`;
  }, [product.images, product.mainImageIndex, getBaseUrl]);

  // Get the other images (not main) for the image list
  const otherImages = useMemo(() => {
    const result = [];
    const placeholder = `${getBaseUrl}/images/pink-placeholder.png`;

    // If we have images array
    if (product.images && product.images.length > 0) {
      const mainIdx = product.mainImageIndex || 0;

      // Add all images except the main one
      for (let i = 0; i < product.images.length; i++) {
        if (i !== mainIdx) {
          result.push(product.images[i]);
        }
      }
    }

    // Fill remaining slots with placeholder if we don't have 4 images
    while (result.length < 4) {
      result.push(placeholder);
    }

    // Return only the first 4 images
    return result.slice(0, 4);
  }, [product.images, product.mainImageIndex, getBaseUrl]);

  // Generate star rating elements based on product rating
  const renderStarRating = useMemo(() => {
    const rating = product.rating || 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<img key={i} src={star_icon} alt="star" />);
      } else {
        stars.push(<img key={i} src={star_dull_icon} alt="star" />);
      }
    }

    return stars;
  }, [product.rating]);

  // Format product types for display
  const productTypes = useMemo(() => {
    if (product.types && product.types.length > 0) {
      return product.types.join(", ");
    }
    return "N/A";
  }, [product.types]);

  // Format product tags for display
  const productTags = useMemo(() => {
    if (product.tags && product.tags.length > 0) {
      return product.tags.join(", ");
    }
    return "N/A";
  }, [product.tags]);

  // Get the review count
  const reviewCount = useMemo(() => {
    return product.reviews ? product.reviews.length : 0;
  }, [product.reviews]);

  // Memoize the handler to prevent unnecessary re-renders
  const handleAddToCart = useCallback(() => {
    // Prevent multiple clicks
    if (isAdding) return;

    setIsAdding(true);

    if (isAuthenticated) {
      dispatch(addToCart({ itemId: product._id, quantity: 1 }));
      setTimeout(() => {
        setIsAdding(false);
      }, 1000); // Prevent multiple clicks for 1 second
    } else {
      alert("Please login to add items to cart");
      setIsAdding(false);
    }
  }, [dispatch, product._id, isAuthenticated, isAdding]);

  return (
    <div className="product-display">
      <div className="product-display-left">
        <div className="product-display-img-list">
          {otherImages.map((img, index) => (
            <img key={index} src={img} alt="" />
          ))}
        </div>
        <div className="product-display-img">
          <img src={mainImage} alt="" className="product-display-main-img" />
        </div>
      </div>
      <div className="product-display-right">
        <h1>{product.name}</h1>
        <div className="product-display-right-stars">
          {renderStarRating.map((star) => star)}
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
          {product.types && product.types.length > 0 ? `${productTypes}` : ""}
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

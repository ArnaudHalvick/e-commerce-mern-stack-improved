// Path: frontend/src/components/descriptionBox/DescriptionBox.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DescriptionBox.css";
import {
  fetchPageReviews,
  fetchReviewCounts,
  resetAllReviewsState,
} from "../../redux/slices/reviewsSlice";

// Import components
import DescriptionContent from "./components/DescriptionContent";
import ReviewsContent from "./components/ReviewsContent";
import ReviewModal from "./components/ReviewModal";

/**
 * Main component for product description and reviews
 * @param {object} props - Component props
 * @param {object} props.product - Product object
 * @returns {JSX.Element} - DescriptionBox component
 */
const DescriptionBox = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const dispatch = useDispatch();

  const {
    pageReviews,
    pageReviewsLoading,
    pageReviewsError,
    pageReviewsLoaded,
    currentProductId,
  } = useSelector((state) => state.reviews);

  // Get the review count
  const reviewCount = product && product.reviews ? product.reviews.length : 0;

  // Reset reviews state when product changes completely
  useEffect(() => {
    // If product ID changed, reset everything
    if (product?._id !== currentProductId) {
      dispatch(resetAllReviewsState());
    }
  }, [product?._id, currentProductId, dispatch]);

  // Fetch STATIC page reviews ONCE when product changes or tab becomes active
  useEffect(() => {
    if (product?._id && !pageReviewsLoaded) {
      // Fetch page reviews only once per product
      dispatch(fetchPageReviews(product._id));

      // Also fetch counts for star ratings
      dispatch(fetchReviewCounts(product._id));
    }
  }, [product?._id, pageReviewsLoaded, dispatch]);

  const handleKeyDown = (e, tabName) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tabName);
    }
  };

  return (
    <div className="description-box-container">
      <div
        className="description-box-navigator"
        role="tablist"
        aria-label="Product Information"
      >
        <div
          className={`description-box-nav-item ${
            activeTab === "description" ? "" : "description-box-fade"
          }`}
          onClick={() => setActiveTab("description")}
          onKeyDown={(e) => handleKeyDown(e, "description")}
          role="tab"
          aria-selected={activeTab === "description"}
          tabIndex={0}
          aria-controls="description-content"
          id="description-tab"
        >
          Description
        </div>
        <div
          className={`description-box-nav-item ${
            activeTab === "reviews" ? "" : "description-box-fade"
          }`}
          onClick={() => setActiveTab("reviews")}
          onKeyDown={(e) => handleKeyDown(e, "reviews")}
          role="tab"
          aria-selected={activeTab === "reviews"}
          tabIndex={0}
          aria-controls="reviews-content"
          id="reviews-tab"
        >
          Reviews ({reviewCount})
        </div>
      </div>

      {activeTab === "description" ? (
        <div
          id="description-content"
          role="tabpanel"
          aria-labelledby="description-tab"
        >
          <DescriptionContent product={product} />
        </div>
      ) : (
        <div id="reviews-content" role="tabpanel" aria-labelledby="reviews-tab">
          <ReviewsContent
            product={product}
            reviews={pageReviews}
            loading={pageReviewsLoading}
            error={pageReviewsError}
            reviewCount={reviewCount}
          />
          <ReviewModal product={product} />
        </div>
      )}
    </div>
  );
};

export default DescriptionBox;

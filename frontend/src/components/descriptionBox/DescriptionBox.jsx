// Path: frontend/src/components/descriptionBox/DescriptionBox.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DescriptionBox.css";
import {
  fetchInitialReviews,
  fetchReviewCounts,
  resetReviewsState,
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

  const { bestReviews, loading, error } = useSelector((state) => state.reviews);

  // Get the review count
  const reviewCount = product && product.reviews ? product.reviews.length : 0;

  // Reset reviews state when product changes
  useEffect(() => {
    dispatch(resetReviewsState());
  }, [product?._id, dispatch]);

  // Fetch latest reviews and review counts when the product changes or the active tab changes to reviews
  useEffect(() => {
    if (activeTab === "reviews" && product?._id) {
      // Check if we already have initial reviews
      const alreadyHasInitialReviews = bestReviews && bestReviews.length > 0;

      // Only fetch initial latest reviews if we don't have them yet
      if (!alreadyHasInitialReviews) {
        // Fetch initial latest reviews - using date-desc sort to get the most recent ones
        dispatch(
          fetchInitialReviews({
            productId: product._id,
            limit: 5,
            sort: "date-desc", // Changed from rating-desc to date-desc to get latest reviews
            ratingFilter: 0,
            bestRated: false, // Changed from true to false since we're not fetching best rated reviews
          })
        );
      }

      // Fetch counts for star ratings
      dispatch(fetchReviewCounts(product._id));
    }
  }, [activeTab, product?._id, dispatch, bestReviews]);

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
            reviews={bestReviews}
            loading={loading}
            error={error}
            reviewCount={reviewCount}
          />
          <ReviewModal product={product} />
        </div>
      )}
    </div>
  );
};

export default DescriptionBox;

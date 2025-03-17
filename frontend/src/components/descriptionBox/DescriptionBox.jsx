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

  const { bestReviews, loading, error, totalReviews } = useSelector(
    (state) => state.reviews
  );

  // Get the review count
  const reviewCount = product && product.reviews ? product.reviews.length : 0;

  // Reset reviews state when product changes
  useEffect(() => {
    dispatch(resetReviewsState());
  }, [product?._id, dispatch]);

  // Fetch best reviews and review counts when the product changes or the active tab changes to reviews
  useEffect(() => {
    if (activeTab === "reviews" && product?._id) {
      // Fetch initial best reviews
      dispatch(
        fetchInitialReviews({
          productId: product._id,
          limit: 5,
          sort: "rating-desc",
          ratingFilter: 0,
          bestRated: true,
        })
      );

      // Fetch counts for star ratings
      dispatch(fetchReviewCounts(product._id));
    }
  }, [activeTab, product?._id, dispatch]);

  return (
    <div className="custom-description-box">
      <div className="custom-navigator">
        <div
          className={`custom-nav-item ${
            activeTab === "description" ? "" : "custom-fade"
          }`}
          onClick={() => setActiveTab("description")}
        >
          Description
        </div>
        <div
          className={`custom-nav-item ${
            activeTab === "reviews" ? "" : "custom-fade"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({totalReviews || reviewCount})
        </div>
      </div>

      {activeTab === "description" ? (
        <DescriptionContent product={product} />
      ) : (
        <>
          <ReviewsContent
            product={product}
            reviews={bestReviews}
            loading={loading}
            error={error}
            totalReviews={totalReviews}
          />
          <ReviewModal product={product} />
        </>
      )}
    </div>
  );
};

export default DescriptionBox;

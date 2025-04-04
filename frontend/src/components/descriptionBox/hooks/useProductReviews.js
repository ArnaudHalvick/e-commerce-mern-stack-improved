import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPageReviews,
  fetchReviewCounts,
  resetAllReviewsState,
} from "../../../redux/slices/reviewsSlice";

/**
 * Custom hook to manage product reviews
 * @param {object} product - The product object
 * @returns {object} - The reviews state and derived data
 */
const useProductReviews = (product) => {
  const dispatch = useDispatch();

  const {
    pageReviews,
    pageReviewsLoading,
    pageReviewsError,
    pageReviewsLoaded,
    currentProductId,
    reviewCounts,
    reviewCountsLoading,
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

  // Fetch STATIC page reviews ONCE when product changes
  useEffect(() => {
    if (product?._id && !pageReviewsLoaded) {
      // Fetch page reviews only once per product
      dispatch(fetchPageReviews(product._id));

      // Also fetch counts for star ratings
      dispatch(fetchReviewCounts(product._id));
    }
  }, [product?._id, pageReviewsLoaded, dispatch]);

  return {
    reviews: pageReviews,
    loading: pageReviewsLoading,
    error: pageReviewsError,
    reviewCount,
    reviewCounts,
    reviewCountsLoading,
  };
};

export default useProductReviews;

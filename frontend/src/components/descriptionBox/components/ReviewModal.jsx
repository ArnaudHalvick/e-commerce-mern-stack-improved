import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import ReviewItem from "./ReviewItem";
import ReviewFilterStars from "./ReviewFilterStars";
import {
  fetchMoreReviews,
  setRatingFilter,
  setSortOption,
  closeReviewModal,
  incrementPage,
  fetchInitialReviews,
} from "../../../redux/slices/reviewsSlice";

/**
 * Skeleton loader for review items
 * @returns {JSX.Element} - Skeleton review component
 */
const ReviewSkeleton = () => {
  return (
    <div className="review-skeleton">
      <div className="review-skeleton-header">
        <div className="review-skeleton-user"></div>
        <div className="review-skeleton-stars"></div>
      </div>
      <div className="review-skeleton-content">
        <div className="review-skeleton-line"></div>
        <div className="review-skeleton-line"></div>
        <div className="review-skeleton-line short"></div>
      </div>
    </div>
  );
};

/**
 * Modal component for viewing all reviews
 * @param {object} props - Component props
 * @param {object} props.product - Product object
 * @returns {JSX.Element} - Review modal component
 */
const ReviewModal = ({ product }) => {
  const dispatch = useDispatch();
  const {
    modalReviews: reviews,
    loading,
    error,
    currentPage,
    hasMore,
    totalReviews,
    sortOption,
    ratingFilter,
    ratingCounts,
    modalOpen,
  } = useSelector((state) => state.reviews);

  // Track if initial load has happened
  const [initialLoad, setInitialLoad] = useState(false);

  const modalRef = useRef(null);
  const reviewsPerPage = 5;

  // Function to fetch more reviews for infinite scrolling
  const fetchMoreData = () => {
    if (loading || !hasMore) return;

    dispatch(
      fetchMoreReviews({
        productId: product._id,
        page: currentPage,
        limit: reviewsPerPage,
        sort: sortOption,
        ratingFilter,
      })
    );

    dispatch(incrementPage());
  };

  // Initial fetch when modal opens or filters change
  useEffect(() => {
    if (modalOpen && product?._id) {
      setInitialLoad(true);

      // Fetch initial reviews with current filters
      dispatch(
        fetchInitialReviews({
          productId: product._id,
          limit: reviewsPerPage,
          sort: sortOption,
          ratingFilter,
        })
      );
    }
  }, [modalOpen, product?._id, sortOption, ratingFilter, dispatch]);

  // Add body class when modal opens to prevent scrolling and clean up when it closes
  useEffect(() => {
    if (modalOpen) {
      // Add class to body to prevent scrolling
      document.body.classList.add("modal-open");
    } else {
      // Remove class when modal closes
      document.body.classList.remove("modal-open");
    }

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        dispatch(closeReviewModal());
      }
    };

    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen, dispatch]);

  // Handle sort option change
  const handleSortChange = (e) => {
    dispatch(setSortOption(e.target.value));
  };

  // Handle rating filter change
  const handleRatingFilter = (rating) => {
    // Make sure we have a valid rating number
    const newRating = parseInt(rating);

    if (isNaN(newRating)) {
      return;
    }

    // Toggle the filter (if same rating is clicked, clear the filter)
    const filterToApply = ratingFilter === newRating ? 0 : newRating;

    // Update the Redux filter state
    dispatch(setRatingFilter(filterToApply));
  };

  // Function to render skeleton loaders
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => <ReviewSkeleton key={index} />);
  };

  if (!modalOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title-area">
            <h2 className="modal-title">Customer Reviews ({totalReviews})</h2>
          </div>
          <div className="sort-options-box">
            <label
              htmlFor="modal-sort-select"
              className="description-sort-options-label"
            >
              Sort by:{" "}
            </label>
            <select
              id="modal-sort-select"
              className="description-sort-options-select"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="date-desc">Latest</option>
              <option value="date-asc">Oldest</option>
            </select>
          </div>

          <button
            className="close-modal-btn"
            onClick={() => dispatch(closeReviewModal())}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-filters">
          <div className="filters-container">
            <h3 className="filters-title">Filter by Rating:</h3>
            <ReviewFilterStars
              ratingFilter={ratingFilter}
              ratingCounts={ratingCounts}
              onRatingFilter={handleRatingFilter}
            />
          </div>
        </div>

        <div id="reviewsContainer" className="modal-reviews-container">
          {/* Show skeletons during initial loading */}
          {loading && reviews.length === 0 && renderSkeletons()}

          {/* Show "no reviews" message only when we're sure there are none */}
          {reviews.length === 0 && initialLoad && !loading && !error && (
            <p className="no-reviews">No reviews match your filter criteria.</p>
          )}

          {error && <p className="reviews-error">Error: {error}</p>}

          <InfiniteScroll
            dataLength={reviews.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={<div className="reviews-loader">Loading...</div>}
            endMessage={
              reviews.length > 0 && (
                <p className="reviews-end-message">You've seen all reviews</p>
              )
            }
            scrollableTarget="reviewsContainer"
          >
            {reviews.map((review, index) => (
              <ReviewItem key={`${review._id}-${index}`} review={review} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

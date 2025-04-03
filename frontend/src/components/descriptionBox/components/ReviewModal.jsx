import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import ReviewItem from "./ReviewItem";
import ReviewFilterStars from "./ReviewFilterStars";
import Modal from "../../../components/ui/modal/Modal";
import {
  fetchMoreReviews,
  setRatingFilter,
  setSortOption,
  closeReviewModal,
  fetchInitialReviews,
} from "../../../redux/slices/reviewsSlice";
import "./ReviewModal.css";

/**
 * Skeleton loader for review items
 * @returns {JSX.Element} - Skeleton review component
 */
const ReviewSkeleton = () => (
  <div className="description-box-modal-review-skeleton">
    <div className="description-box-modal-review-skeleton-header">
      <div className="description-box-modal-review-skeleton-user"></div>
      <div className="description-box-modal-review-skeleton-stars"></div>
    </div>
    <div className="description-box-modal-review-skeleton-content">
      <div className="description-box-modal-review-skeleton-line"></div>
      <div className="description-box-modal-review-skeleton-line"></div>
      <div className="description-box-modal-review-skeleton-line short"></div>
    </div>
  </div>
);

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
    currentOffset,
    hasMore,
    totalReviews,
    sortOption,
    ratingFilter,
    ratingCounts,
    modalOpen,
  } = useSelector((state) => state.reviews);

  // Track if initial load has happened
  const [initialLoad, setInitialLoad] = useState(false);

  // Flag to track if we've already pre-loaded the next batch
  const [preloaded, setPreloaded] = useState(false);

  const reviewsPerPage = 5;

  // Handle closing the modal
  const handleCloseModal = () => {
    dispatch(closeReviewModal());
  };

  // Function to fetch more reviews for infinite scrolling
  const fetchMoreData = () => {
    if (loading || !hasMore) return;

    dispatch(
      fetchMoreReviews({
        productId: product._id,
        offset: currentOffset,
        limit: reviewsPerPage,
        sort: sortOption,
        ratingFilter,
      })
    );
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    dispatch(setSortOption(e.target.value));
  };

  // Handle rating filter change
  const handleRatingFilter = (rating) => {
    // Make sure we have a valid rating number
    const newRating = parseInt(rating);

    if (isNaN(newRating)) return;

    // Toggle the filter (if same rating is clicked, clear the filter)
    const filterToApply = ratingFilter === newRating ? 0 : newRating;

    // Update the Redux filter state
    dispatch(setRatingFilter(filterToApply));
  };

  // Function to render skeleton loaders
  const renderSkeletons = () =>
    Array(3)
      .fill(0)
      .map((_, index) => <ReviewSkeleton key={index} />);

  // Initial fetch when modal opens or filters change
  useEffect(() => {
    if (!modalOpen || !product?._id) return;

    setInitialLoad(true);
    setPreloaded(false);

    // Fetch initial reviews with current filters
    dispatch(
      fetchInitialReviews({
        productId: product._id,
        limit: reviewsPerPage,
        sort: sortOption,
        ratingFilter,
        bestRated: false,
      })
    );
  }, [
    modalOpen,
    product?._id,
    sortOption,
    ratingFilter,
    dispatch,
    reviewsPerPage,
  ]);

  // Pre-load next batch of reviews after initial load
  useEffect(() => {
    // Only pre-load if we have initial reviews, are not currently loading,
    // have more to load, and haven't preloaded yet
    if (!reviews.length || loading || !hasMore || preloaded || !initialLoad)
      return;

    setPreloaded(true);

    // Pre-load the next batch
    dispatch(
      fetchMoreReviews({
        productId: product._id,
        offset: currentOffset,
        limit: reviewsPerPage,
        sort: sortOption,
        ratingFilter,
      })
    );
  }, [
    reviews.length,
    loading,
    hasMore,
    preloaded,
    initialLoad,
    dispatch,
    product?._id,
    currentOffset,
    reviewsPerPage,
    sortOption,
    ratingFilter,
  ]);

  // Calculate the actual reviews count to display
  // If we have a specific rating filter active, show count for that filter
  // Otherwise show total reviews count
  const displayReviewCount =
    ratingFilter > 0 && ratingCounts
      ? ratingCounts[ratingFilter] || 0
      : totalReviews;

  const modalTitle = `Customer Reviews (${displayReviewCount})`;

  const modalContent = (
    <>
      <div className="description-box-modal-filters-container">
        <h3 className="description-box-modal-filters-title">
          Filter by Rating:
        </h3>
        <ReviewFilterStars
          ratingFilter={ratingFilter}
          ratingCounts={ratingCounts}
          onRatingFilter={handleRatingFilter}
        />
      </div>

      <div className="description-box-modal-sort-options">
        <label
          htmlFor="modal-sort-select"
          className="description-box-modal-sort-label"
        >
          Sort by:{" "}
        </label>
        <select
          id="modal-sort-select"
          className="description-box-modal-sort-select"
          value={sortOption}
          onChange={handleSortChange}
          aria-label="Sort reviews"
        >
          <option value="date-desc">Latest</option>
          <option value="date-asc">Oldest</option>
        </select>
      </div>

      <div
        id="reviewsContainer"
        className="description-box-modal-reviews-container"
      >
        {/* Show skeletons during initial loading */}
        {loading && reviews.length === 0 && renderSkeletons()}

        {/* Show "no reviews" message only when we're sure there are none */}
        {reviews.length === 0 && initialLoad && !loading && !error && (
          <p className="description-box-modal-no-reviews">
            No reviews match your filter criteria.
          </p>
        )}

        {error && <p className="description-box-modal-error">Error: {error}</p>}

        <InfiniteScroll
          dataLength={reviews.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div
              className="description-box-modal-reviews-loader"
              aria-live="polite"
            >
              Loading more reviews...
            </div>
          }
          endMessage={
            reviews.length > 0 && (
              <p className="description-box-modal-reviews-end">
                You've seen all reviews
              </p>
            )
          }
          scrollableTarget="reviewsContainer"
          className="description-box-modal-infinite-scroll"
        >
          {reviews.map((review, index) => (
            <ReviewItem key={`${review._id}-${index}`} review={review} />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={modalOpen}
      onClose={handleCloseModal}
      title={modalTitle}
      className="description-box-modal"
      size="xlarge"
      closeOnEscape={true}
      closeOnOverlayClick={true}
    >
      {modalContent}
    </Modal>
  );
};

export default ReviewModal;

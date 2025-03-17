import React, { useEffect, useRef } from "react";
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
} from "../../../redux/slices/reviewsSlice";

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
      // Fetch first page of reviews with current filters
      dispatch(
        fetchMoreReviews({
          productId: product._id,
          page: 1,
          limit: reviewsPerPage,
          sort: sortOption,
          ratingFilter,
        })
      );
    }
  }, [modalOpen, product?._id, sortOption, ratingFilter, dispatch]);

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
    dispatch(setRatingFilter(rating));
  };

  if (!modalOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title-area">
            <h2 className="modal-title">Customer Reviews ({totalReviews})</h2>
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
          </div>
          <button
            className="close-modal-btn"
            onClick={() => dispatch(closeReviewModal())}
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
          {reviews.length === 0 && !loading && !error && (
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
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

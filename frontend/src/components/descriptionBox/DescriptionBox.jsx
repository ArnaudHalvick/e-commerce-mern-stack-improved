// Path: frontend/src/components/descriptionBox/DescriptionBox.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DescriptionBox.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { reviewsApi } from "../../services/api";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  fetchInitialReviews,
  fetchMoreReviews,
  fetchReviewCounts,
  setRatingFilter,
  setSortOption,
  openReviewModal,
  closeReviewModal,
  incrementPage,
  resetReviewsState,
} from "../../redux/slices/reviewsSlice";

// ReviewModal component
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

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating for a review
  const renderReviewRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <img key={i} src={star_icon} alt="star" className="review-star" />
        );
      } else {
        stars.push(
          <img
            key={i}
            src={star_dull_icon}
            alt="star"
            className="review-star"
          />
        );
      }
    }
    return stars;
  };

  // Render filter stars in a more compact horizontal layout
  const renderFilterStars = () => {
    return (
      <div className="rating-filters-row">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div
            key={rating}
            className={`rating-filter-compact ${
              ratingFilter === rating ? "active" : ""
            }`}
            onClick={() => handleRatingFilter(rating)}
          >
            <div className="filter-star-row">
              {Array(rating)
                .fill()
                .map((_, index) => (
                  <img
                    key={index}
                    src={star_icon}
                    alt="star"
                    className="filter-star"
                  />
                ))}
              {Array(5 - rating)
                .fill()
                .map((_, index) => (
                  <img
                    key={index + rating}
                    src={star_dull_icon}
                    alt="star"
                    className="filter-star"
                  />
                ))}
            </div>
            <span className="rating-count">({ratingCounts[rating] || 0})</span>
          </div>
        ))}
        {ratingFilter > 0 && (
          <button
            className="description-clear-filter-btn"
            onClick={() => handleRatingFilter(0)}
          >
            Clear
          </button>
        )}
      </div>
    );
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
            {renderFilterStars()}
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
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="review-user-info">
                    <div className="review-avatar">
                      <div className="default-avatar">
                        {review.user?.name?.charAt(0) || "?"}
                      </div>
                    </div>
                    <div className="review-user-details">
                      <p className="review-user-name">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <p className="review-date">{formatDate(review.date)}</p>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderReviewRating(review.rating)}
                  </div>
                </div>

                <div className="review-content">
                  <p className="review-content-text">{review.content}</p>
                </div>

                {review.verifiedPurchase && (
                  <div className="verified-badge">
                    <span className="verified-badge-check">✓</span> Verified
                    Purchase
                  </div>
                )}
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

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

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating for a review
  const renderReviewRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <img key={i} src={star_icon} alt="star" className="review-star" />
        );
      } else {
        stars.push(
          <img
            key={i}
            src={star_dull_icon}
            alt="star"
            className="review-star"
          />
        );
      }
    }
    return stars;
  };

  const handleOpenModal = () => {
    dispatch(openReviewModal());
  };

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
        <div className="custom-description-content">
          {product && product.longDescription
            ? product.longDescription
            : "E-commerce websites have revolutionized the way we shop for clothing. With just a few clicks, customers can browse through a vast selection of apparel, from casual wear to formal attire. The convenience of online shopping allows users to compare prices, read reviews, and find the latest trends without leaving their homes."}
        </div>
      ) : (
        <div className="custom-reviews-content">
          <div className="reviews-header">
            <h2 className="reviews-header-title">Customer Reviews</h2>
          </div>

          {/* Loading and Error States */}
          {loading && <p className="reviews-loading">Loading reviews...</p>}
          {error && <p className="reviews-error">Error: {error}</p>}

          {/* Empty State */}
          {!loading && !error && bestReviews.length === 0 && (
            <p className="no-reviews">
              No reviews yet. Be the first to review this product!
            </p>
          )}

          {/* Top Reviews List */}
          {!loading && !error && bestReviews.length > 0 && (
            <div className="reviews-list">
              {bestReviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="review-user-info">
                      <div className="review-avatar">
                        <div className="default-avatar">
                          {review.user?.name?.charAt(0) || "?"}
                        </div>
                      </div>
                      <div className="review-user-details">
                        <p className="review-user-name">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="review-date">{formatDate(review.date)}</p>
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderReviewRating(review.rating)}
                    </div>
                  </div>

                  <div className="review-content">
                    <p className="review-content-text">{review.content}</p>
                  </div>

                  {review.verifiedPurchase && (
                    <div className="verified-badge">
                      <span className="verified-badge-check">✓</span> Verified
                      Purchase
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* See All Reviews Button */}
          {!loading && !error && bestReviews.length > 0 && totalReviews > 5 && (
            <div className="see-all-reviews">
              <button className="see-all-button" onClick={handleOpenModal}>
                See All Reviews
              </button>
            </div>
          )}

          {/* Review Modal */}
          <ReviewModal product={product} />
        </div>
      )}
    </div>
  );
};

export default DescriptionBox;

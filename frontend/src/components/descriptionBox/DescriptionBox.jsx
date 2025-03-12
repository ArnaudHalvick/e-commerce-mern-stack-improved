// Path: frontend/src/components/descriptionBox/DescriptionBox.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import "./DescriptionBox.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { reviewsApi } from "../../services/api";

const DescriptionBox = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOption, setSortOption] = useState("date-desc");
  const reviewsPerPage = 5;

  // Get the review count
  const reviewCount = product && product.reviews ? product.reviews.length : 0;

  // Function to fetch reviews using the API service
  const fetchReviews = useCallback(async () => {
    if (!product?._id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await reviewsApi.getProductReviews(
        product._id,
        page,
        reviewsPerPage,
        sortOption
      );

      if (data.success) {
        setReviews(data.reviews);
        setTotalReviews(data.count);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(
        typeof err === "string"
          ? err
          : "An error occurred while fetching reviews"
      );
    } finally {
      setLoading(false);
    }
  }, [product?._id, page, reviewsPerPage, sortOption]);

  // Fetch reviews when the product changes or the active tab changes to reviews
  useEffect(() => {
    if (activeTab === "reviews" && product?._id) {
      fetchReviews();
    }
  }, [activeTab, fetchReviews, product?._id]);

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
          Reviews ({totalReviews > 0 ? totalReviews : reviewCount})
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
          {/* Reviews Sort */}
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            <div className="reviews-sort">
              <label htmlFor="sort-select">Sort by: </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1); // Reset to page 1 when sort changes
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <p className="reviews-loading">Loading reviews...</p>}
          {error && <p className="reviews-error">Error: {error}</p>}

          {/* Empty State */}
          {!loading && !error && reviews.length === 0 && (
            <p className="no-reviews">
              No reviews yet. Be the first to review this product!
            </p>
          )}

          {/* Reviews List */}
          {!loading && !error && reviews.length > 0 && (
            <div className="reviews-list">
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
                    <p>{review.content}</p>
                  </div>

                  {review.verifiedPurchase && (
                    <div className="verified-badge">
                      <span>✓</span> Verified Purchase
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="reviews-pagination">
              <button
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1 || loading}
                className="pagination-btn"
              >
                Previous
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      disabled={loading}
                      className={`pagination-page ${
                        pageNum === page ? "active" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setPage(page < totalPages ? page + 1 : totalPages)
                }
                disabled={page === totalPages || loading}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionBox;

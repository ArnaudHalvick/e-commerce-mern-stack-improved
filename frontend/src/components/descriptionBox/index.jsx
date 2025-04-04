// External Libraries
import React from "react";

// Internal Components
import { DescriptionContent, ReviewsContent, ReviewModal } from "./components";

// Internal Hooks
import { useProductReviews, useTabs } from "./hooks";

// Styles
import "./styles/DescriptionBox.css";

/**
 * Main component for product description and reviews
 * @param {object} props - Component props
 * @param {object} props.product - Product object
 * @returns {JSX.Element} - DescriptionBox component
 */
const DescriptionBox = ({ product }) => {
  // Custom hooks
  const { activeTab, handleTabChange, handleKeyDown } = useTabs("description");
  const { reviews, loading, error, reviewCount } = useProductReviews(product);

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
          onClick={() => handleTabChange("description")}
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
          onClick={() => handleTabChange("reviews")}
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
            reviews={reviews}
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

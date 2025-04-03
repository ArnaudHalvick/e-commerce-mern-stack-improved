import { memo } from "react";
import PropTypes from "prop-types";

/**
 * Page header component for product listing pages (offers and category)
 * Shows different content based on pageType
 */
const PageHeader = ({ pageType, category, banner }) => {
  // For category pages with banner
  if (pageType === "category" && banner) {
    return (
      <div className="product-listing-header">
        <img
          src={banner}
          alt={`${category} collection`}
          className="product-listing-banner"
          loading="eager"
        />
      </div>
    );
  }

  // For category pages without banner
  if (pageType === "category") {
    const categoryTitle = category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
      : "Collection";

    return (
      <div className="product-listing-header">
        <div className="product-listing-title-container">
          <h1 className="product-listing-title">{categoryTitle}</h1>
          <p className="product-listing-subtitle">
            Explore our latest {category} collection with the finest quality and
            trends.
          </p>
        </div>
      </div>
    );
  }

  // For offers page
  return (
    <div className="product-listing-header">
      <div className="product-listing-title-container">
        <h1 className="product-listing-title">Special Offers & Deals</h1>
        <p className="product-listing-subtitle">
          Discover our best deals and special offers on premium clothing items.
        </p>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  pageType: PropTypes.oneOf(["offers", "category"]).isRequired,
  category: PropTypes.string,
  banner: PropTypes.string,
};

export default memo(PageHeader);

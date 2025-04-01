import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Import components
import { PageHeader, ProductsContent } from "./components";
import FilterSidebar from "../../components/filterSidebar/FilterSidebar";

// Import custom hook
import { useProductListingData } from "./hooks";

// Styles
import "./ProductListingPage.css";

/**
 * Unified Product Listing component that handles both Offers and Category pages
 * @param {Object} props Component props
 * @param {string} props.pageType Type of page ('offers' or 'category')
 * @param {string} props.category Category name (for category pages)
 * @param {string} props.banner Banner image URL (for category pages)
 */
const ProductListingPage = ({
  pageType = "offers",
  category: propCategory,
  banner,
}) => {
  // Get category from URL params or props
  const { category: paramCategory } = useParams();
  const category = propCategory || paramCategory;
  const location = useLocation();

  // Add a local loading timeout state to prevent flickering
  const [showLoading, setShowLoading] = useState(false);

  // Determine if this is a category page or offers page
  const isCategoryPage = pageType === "category";

  // Scroll to top when the component mounts or the URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const {
    // Data
    displayedProducts,
    loading,
    error,
    totalPages,
    currentPage,
    itemsPerPage,
    sortBy,
    showSortOptions,
    filters,
    availableTags,
    availableTypes,

    // Display info
    displayRange,
    totalProducts,

    // Actions
    setShowSortOptions,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    clearAllFilters,
  } = useProductListingData({ pageType, category });

  // Use effect to delay showing loading indicator to prevent flickering
  useEffect(() => {
    let timeoutId;

    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, 300); // Show loading after 300ms to prevent flashes
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Manage page title and metadata
  useEffect(() => {
    if (isCategoryPage && category) {
      document.title = `${
        category.charAt(0).toUpperCase() + category.slice(1)
      } Collection | Your E-Commerce Store`;
    } else {
      document.title = "Special Offers & Deals | Your E-Commerce Store";
    }
  }, [isCategoryPage, category]);

  // Check for URL parameters and set filters accordingly (for offers page)
  useEffect(() => {
    if (!isCategoryPage) {
      const params = new URLSearchParams(location.search);
      const discountParam = params.get("discount");

      if (discountParam === "true" && !filters.discount) {
        handleFilterChange("discount", true);
      }
    }
  }, [location.search, filters.discount, handleFilterChange, isCategoryPage]);

  // Show loading state
  if (showLoading) {
    return (
      <div className="product-listing-container">
        {isCategoryPage && (
          <PageHeader pageType={pageType} category={category} banner={banner} />
        )}
        {!isCategoryPage && <PageHeader pageType={pageType} />}
        <div className="product-listing-loading">Loading products...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="product-listing-container">
        {isCategoryPage && (
          <PageHeader pageType={pageType} category={category} banner={banner} />
        )}
        {!isCategoryPage && <PageHeader pageType={pageType} />}
        <div className="product-listing-error">
          <h2 className="product-listing-error-title">
            Error Loading Products
          </h2>
          <p className="product-listing-error-message">{error}</p>
          <button
            className="product-listing-error-button"
            onClick={clearAllFilters}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-listing-container">
      {/* Header - different based on page type */}
      {isCategoryPage && (
        <PageHeader pageType={pageType} category={category} banner={banner} />
      )}
      {!isCategoryPage && <PageHeader pageType={pageType} />}

      <div className="product-listing-content">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          handleFilterChange={handleFilterChange}
          availableTags={availableTags}
          availableTypes={availableTypes}
          clearAllFilters={clearAllFilters}
          showCategoryFilter={!isCategoryPage} // Only show category filter on offers page
        />

        {/* Products area */}
        <ProductsContent
          displayedProducts={displayedProducts || []}
          totalProducts={totalProducts}
          displayRange={displayRange}
          showSortOptions={showSortOptions}
          setShowSortOptions={setShowSortOptions}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          clearAllFilters={clearAllFilters}
        />
      </div>
    </div>
  );
};

ProductListingPage.propTypes = {
  pageType: PropTypes.oneOf(["offers", "category"]),
  category: PropTypes.string,
  banner: PropTypes.string,
};

export default ProductListingPage;

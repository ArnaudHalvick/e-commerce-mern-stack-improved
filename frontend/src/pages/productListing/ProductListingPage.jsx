import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Import components
import { PageHeader, ProductsContent } from "./components";
import FilterSidebar from "../../components/filterSidebar/";
import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Import custom hook
import { useProductListingData } from "./hooks";

// Styles
import "./ProductListingPage.css";

/**
 * Unified Product Listing component that handles both Shop and Category pages
 * @param {Object} props Component props
 * @param {string} props.pageType Type of page ('shop' or 'category')
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

  // Configure breadcrumbs based on page type
  const getBreadcrumbRoutes = () => {
    const routes = [{ label: "Home", path: "/" }];

    if (pageType === "category" && category) {
      routes.push({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        isCurrent: true,
      });
    } else if (pageType === "offers") {
      routes.push({
        label: "Special Offers",
        isCurrent: true,
      });
    }

    return routes;
  };

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

  // Remove the effect that synchronizes URL to filter state, and replace it with a simpler
  // approach - only initialize the filter on first load
  useEffect(() => {
    // Only run once on component mount to initialize from URL
    if (!isCategoryPage) {
      const params = new URLSearchParams(location.search);
      const discountParam = params.get("discount");

      if (discountParam === "true") {
        // Initial setup from URL, won't be called again on filter changes
        handleFilterChange("discount", true);
      }
    }
    // Run only once on component mount despite dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCategoryPage, handleFilterChange, location.search]);

  // Custom handler for discount filter changes that also updates URL
  const handleDiscountFilterChange = useCallback(() => {
    // Toggle the current discount filter state
    const newValue = !filters.discount;

    // Update filter state
    handleFilterChange("discount", newValue);

    // Update URL without causing a navigation/reload
    const params = new URLSearchParams(location.search);

    if (newValue) {
      params.set("discount", "true");
    } else {
      params.delete("discount");
    }

    const newUrl = `${location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.replaceState({}, "", newUrl);
  }, [
    filters.discount,
    handleFilterChange,
    location.pathname,
    location.search,
  ]);

  // Custom clear all handler that also updates URL
  const handleClearAll = useCallback(() => {
    // First clear all filters using the existing function
    clearAllFilters();

    // Then manually update the URL to remove discount parameter
    const params = new URLSearchParams(location.search);
    params.delete("discount");

    const newUrl = `${location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.replaceState({}, "", newUrl);
  }, [clearAllFilters, location.pathname, location.search]);

  // Show loading state
  if (showLoading) {
    return (
      <>
        <Breadcrumb routes={getBreadcrumbRoutes()} />
        <div className="product-listing-container">
          {isCategoryPage && (
            <PageHeader
              pageType={pageType}
              category={category}
              banner={banner}
            />
          )}
          {!isCategoryPage && <PageHeader pageType={pageType} />}
          <div className="product-listing-loading">Loading products...</div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Breadcrumb routes={getBreadcrumbRoutes()} />
        <div className="product-listing-container">
          {isCategoryPage && (
            <PageHeader
              pageType={pageType}
              category={category}
              banner={banner}
            />
          )}
          {!isCategoryPage && <PageHeader pageType={pageType} />}
          <div className="product-listing-error">
            <h2 className="product-listing-error-title">
              Error Loading Products
            </h2>
            <p className="product-listing-error-message">{error}</p>
            <button
              className="product-listing-error-button"
              onClick={handleClearAll}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb routes={getBreadcrumbRoutes()} />
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
            handleDiscountFilterChange={handleDiscountFilterChange}
            availableTags={availableTags}
            availableTypes={availableTypes}
            clearAllFilters={handleClearAll}
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
            clearAllFilters={handleClearAll}
          />
        </div>
      </div>
    </>
  );
};

ProductListingPage.propTypes = {
  pageType: PropTypes.oneOf(["offers", "category"]),
  category: PropTypes.string,
  banner: PropTypes.string,
};

export default ProductListingPage;

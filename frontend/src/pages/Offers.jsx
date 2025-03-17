import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Import components
import {
  OffersBreadcrumb,
  OffersHeader,
  FilterSidebar,
  ProductsContent,
} from "./components";

// Import custom hook
import { useOffersData } from "./hooks";

// Styles
import "../CSS/Offers.css";

/**
 * Main Offers page component that displays special offers and deals
 */
const Offers = () => {
  const location = useLocation();

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
  } = useOffersData();

  // Manage page title and metadata
  useEffect(() => {
    document.title = "Special Offers & Deals | Your E-Commerce Store";
  }, []);

  // Check for URL parameters and set filters accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const discountParam = params.get("discount");

    if (discountParam === "true" && !filters.discount) {
      handleFilterChange("discount", true);
    }
  }, [location.search, filters.discount, handleFilterChange]);

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading products...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Error Loading Products</h2>
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={clearAllFilters}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="offers-container">
      <OffersBreadcrumb />
      <OffersHeader />

      <div className="offers-main-content">
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          handleFilterChange={handleFilterChange}
          availableTags={availableTags}
          availableTypes={availableTypes}
          clearAllFilters={clearAllFilters}
          showCategoryFilter={true}
        />

        {/* Products area */}
        <ProductsContent
          displayedProducts={displayedProducts}
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

export default Offers;

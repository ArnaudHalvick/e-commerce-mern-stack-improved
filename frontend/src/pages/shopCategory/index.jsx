import React from "react";

// Components
import CategoryHeader from "./components/CategoryHeader";
import ProductsContent from "./components/ProductsContent";
import FilterSidebar from "../../components/filterSidebar/FilterSidebar";

// Hooks
import useCategoryProducts from "./hooks/useCategoryProducts";

// Styles
import "../CSS/ShopCategory.css";
import "../../components/errorHandling/LoadingIndicator.css";

/**
 * Shop category page component that displays products by category with filtering
 *
 * @param {Object} props - Component props
 * @param {String} props.category - Category name (men, women, kids)
 * @param {String} props.banner - Banner image URL for the category
 */
const ShopCategory = (props) => {
  const {
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
    displayRange,
    totalProducts,
    setShowSortOptions,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    clearAllFilters,
  } = useCategoryProducts(props.category);

  if (loading) {
    return (
      <div className="product-category-container">
        <CategoryHeader category={props.category} banner={props.banner} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-category-container">
        <CategoryHeader category={props.category} banner={props.banner} />
        <div className="error-container">
          <h2 className="error-title">Error Loading Products</h2>
          <p className="error-message">{error}</p>
          <button
            className="error-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-category-container">
      <CategoryHeader category={props.category} banner={props.banner} />

      <div className="category-main-content">
        {/* Filter sidebar - note showCategoryFilter is false */}
        <FilterSidebar
          filters={filters}
          handleFilterChange={handleFilterChange}
          availableTags={availableTags}
          availableTypes={availableTypes}
          clearAllFilters={clearAllFilters}
          showCategoryFilter={false} // Hide category filter since we're already in a specific category
        />

        {/* Products content */}
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

export default ShopCategory;
